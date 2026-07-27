// src/data/timeline.ts
// Derives an employment timeline from the free-text dates in resume.ts.
//
// resume.ts is the content source and stays hand-authored, so its dates are prose:
// 'June 2024', 'Nov 2015', and the magic string 'Present'. This module is the only
// place that interprets them. Anything it cannot parse throws at build time rather
// than being skipped — a timeline missing a role is a quieter lie than one that fails
// to render, and the hardline data rule prefers a loud absence to a quiet distortion.
import { experience } from '@/data/resume';

const MONTHS = [
  'january', 'february', 'march', 'april', 'may', 'june',
  'july', 'august', 'september', 'october', 'november', 'december',
];

/** Months since year 0. A single integer axis makes spans and gaps plain subtraction. */
function toMonthIndex(year: number, month: number): number {
  return year * 12 + month;
}

function parseMonthYear(value: string, context: string): number {
  const match = value.trim().match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (!match) {
    throw new Error(`resume.ts: cannot parse date "${value}" (${context}). Expected "Month YYYY" or "Present".`);
  }

  const name = match[1].toLowerCase();
  // Accepts both 'June' and 'Nov' — resume.ts uses full names in `experience` and
  // abbreviations in `education`, and neither format is worth normalising by hand.
  const month = MONTHS.findIndex((m) => m === name || m.startsWith(name));
  if (month < 0) {
    throw new Error(`resume.ts: "${match[1]}" in "${value}" (${context}) is not a month name.`);
  }

  return toMonthIndex(Number(match[2]), month);
}

export interface TimelineSegment {
  role: string;
  /** Percentage offsets within the parent bar, so a segment needs no axis of its own. */
  offset: number;
  width: number;
  months: number;
  period: string;
  label: string;
}

export interface TimelineBar {
  company: string;
  url: string;
  /** Percentage offsets along the full span. */
  offset: number;
  width: number;
  months: number;
  ongoing: boolean;
  label: string;
  period: string;
  /** More than one when a company was held across a promotion or title change. */
  segments: TimelineSegment[];
}

export interface TimelineGap {
  offset: number;
  width: number;
  months: number;
}

export interface Timeline {
  bars: TimelineBar[];
  gaps: TimelineGap[];
  /** Year ticks across the span, first and last inclusive. */
  ticks: { year: number; offset: number }[];
  totalMonths: number;
  employedMonths: number;
  /** The month the ongoing role was measured against, so the figure dates itself. */
  asOf: string;
}

function formatMonthIndex(index: number): string {
  const month = MONTHS[((index % 12) + 12) % 12];
  return `${month.slice(0, 3).replace(/^./, (c) => c.toUpperCase())} ${Math.floor(index / 12)}`;
}

function formatDuration(months: number): string {
  const years = Math.floor(months / 12);
  const rest = months % 12;
  if (years === 0) return `${rest} mo`;
  if (rest === 0) return `${years} yr`;
  return `${years} yr ${rest} mo`;
}

export function buildTimeline(now = new Date()): Timeline {
  // `Present` resolves to the month the site was built, which is the only month the
  // figure can honestly claim to be current as of. Stated on the figure rather than
  // implied, so a stale deploy reads as stale instead of silently accruing tenure.
  const nowIndex = toMonthIndex(now.getUTCFullYear(), now.getUTCMonth());

  // resume.ts is authored newest-first; a timeline reads oldest-first.
  const roles = [...experience].reverse().map((job) => {
    const start = parseMonthYear(job.start, `${job.company} start`);
    const end = job.end.trim().toLowerCase() === 'present'
      ? nowIndex
      : parseMonthYear(job.end, `${job.company} end`);

    if (end < start) {
      throw new Error(`resume.ts: ${job.company} "${job.role}" ends (${job.end}) before it starts (${job.start}).`);
    }

    return { ...job, start, end, ongoing: job.end.trim().toLowerCase() === 'present' };
  });

  if (roles.length === 0) {
    throw new Error('resume.ts: experience is empty, so there is no timeline to draw.');
  }

  // Consecutive roles at the same employer are one tenure with an internal division,
  // not two jobs. Two of the five entries are the same company either side of a
  // promotion; drawing them as separate bars would show more employers than there were.
  const grouped: { company: string; url: string; roles: typeof roles }[] = [];
  for (const role of roles) {
    const last = grouped[grouped.length - 1];
    if (last && last.company === role.company) {
      last.roles.push(role);
    } else {
      grouped.push({ company: role.company, url: role.url, roles: [role] });
    }
  }

  const origin = roles[0].start;
  const finish = Math.max(...roles.map((r) => r.end));
  const totalMonths = finish - origin;

  if (totalMonths <= 0) {
    throw new Error('resume.ts: every role starts and ends in the same month, so the span is zero.');
  }

  const pct = (months: number) => (months / totalMonths) * 100;

  const bars: TimelineBar[] = grouped.map((group) => {
    const start = Math.min(...group.roles.map((r) => r.start));
    const end = Math.max(...group.roles.map((r) => r.end));
    const months = end - start;
    const ongoing = group.roles.some((r) => r.ongoing);

    return {
      company: group.company,
      url: group.url,
      offset: pct(start - origin),
      width: pct(months),
      months,
      ongoing,
      label: formatDuration(months),
      period: `${formatMonthIndex(start)} – ${ongoing ? 'present' : formatMonthIndex(end)}`,
      segments: group.roles.map((role) => ({
        role: role.role,
        offset: months === 0 ? 0 : ((role.start - start) / months) * 100,
        width: months === 0 ? 100 : ((role.end - role.start) / months) * 100,
        months: role.end - role.start,
        period: `${formatMonthIndex(role.start)} – ${role.ongoing ? 'present' : formatMonthIndex(role.end)}`,
        label: formatDuration(role.end - role.start),
      })),
    };
  });

  // Real gaps between employers. Drawn rather than closed up: a career with two short
  // breaks in it is what the data says, and a seamless bar would be the invention.
  const gaps: TimelineGap[] = [];
  for (let i = 1; i < bars.length; i++) {
    const previousEnd = bars[i - 1].offset + bars[i - 1].width;
    const width = bars[i].offset - previousEnd;
    if (width > 0.01) {
      gaps.push({
        offset: previousEnd,
        width,
        months: Math.round((width / 100) * totalMonths),
      });
    }
  }

  const firstYear = Math.floor(origin / 12);
  const lastYear = Math.floor(finish / 12);
  const ticks = Array.from({ length: lastYear - firstYear + 1 }, (_, i) => {
    const year = firstYear + i;
    return { year, offset: pct(toMonthIndex(year, 0) - origin) };
  }).filter((tick) => tick.offset >= 0 && tick.offset <= 100);

  return {
    bars,
    gaps,
    ticks,
    totalMonths,
    employedMonths: bars.reduce((sum, bar) => sum + bar.months, 0),
    asOf: `${MONTHS[now.getUTCMonth()].slice(0, 3).replace(/^./, (c) => c.toUpperCase())} ${now.getUTCFullYear()}`,
  };
}
