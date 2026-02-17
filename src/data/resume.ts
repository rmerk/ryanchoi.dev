// src/data/resume.ts

interface ExperienceEntry {
  role: string;
  company: string;
  url: string;
  start: string;
  end: string;
  bullets: string[];
}

interface EducationEntry {
  credential: string;
  institution: string;
  url: string;
  start: string;
  end: string;
}

type Skills = Record<string, string[]>;

export const experience: ExperienceEntry[] = [
  {
    role: 'Web Development Engineer',
    company: 'Kount, an Equifax Company',
    url: 'https://kount.com',
    start: 'June 2024',
    end: 'Present',
    bullets: [
      'Develop, customize, and maintain branded templates for Zendesk Guide, Help Centers, and other Zendesk products.',
      'Ensure designs are responsive, accessible, and meet modern UI/UX standards.',
      'Write clean, efficient, and reusable code using HTML, CSS, SASS, TypeScript/JavaScript, Handlebars, and Zendesk templating.',
    ],
  },
  {
    role: 'Frontend Developer',
    company: 'Agile Resources, Inc.',
    url: 'https://agileresourcesinc.com',
    start: 'September 2022',
    end: 'June 2024',
    bullets: [
      'Initially contracted to Kount, an Equifax Company to handle frontend web development projects, later converted to full-time.',
    ],
  },
  {
    role: 'Software Engineer (Frontend)',
    company: 'Routable',
    url: 'https://routable.com',
    start: 'October 2021',
    end: 'June 2022',
    bullets: [
      'Built new React components and modules to deliver roadmap deliverables, such as opening cross-border payment rails.',
      'Refactored frontend architecture to integrate backend constants, allowing the team to ship faster and reduce bugs.',
      'Improved code quality and test coverage using Jest, Sinon, and Storybook to exceed 85% code coverage.',
    ],
  },
  {
    role: 'Senior Software Engineer',
    company: 'Total Expert',
    url: 'https://totalexpert.com',
    start: 'February 2020',
    end: 'June 2021',
    bullets: [
      'Collaborated with the product team to enhance customer productivity and boost lead generation through new features.',
      'Led multiple web development initiatives, overseeing all stages from planning to successful deployment.',
      'Designed and implemented reusable Vue components, significantly accelerating development timelines.',
    ],
  },
  {
    role: 'Software Engineer',
    company: 'Total Expert',
    url: 'https://totalexpert.com',
    start: 'January 2016',
    end: 'February 2020',
    bullets: [
      'Developed new features and platform capabilities for a FinTech platform using cutting-edge developer tools.',
      'Analyzed problems and collaborated with business users, customers, and team members to deliver innovative solutions.',
      'Led software scrum projects, overseeing planning and estimation, communicating team progress, and addressing risks.',
    ],
  },
];

export const education: EducationEntry[] = [
  {
    credential: 'Software Engineer Certificate',
    institution: 'Prime Digital Academy',
    url: 'https://primedigitalacademy.com',
    start: 'July 2015',
    end: 'Nov 2015',
  },
];

export const skills: Skills = {
  Languages: ['TypeScript', 'JavaScript', 'PHP'],
  Frameworks: ['Vue', 'React', 'Astro'],
  Tools: ['Docker', 'Figma', 'Sass', 'Vite', 'Git', 'Tailwind CSS'],
  Databases: ['MariaDB', 'PostgreSQL', 'MySQL'],
};
