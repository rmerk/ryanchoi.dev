import type { APIRoute } from 'astro';

const getRobotsTxt = (site: URL) => `User-agent: *
Allow: /

Sitemap: ${new URL('/sitemap.xml', site).href}
`;

export const GET: APIRoute = ({ site }) => {
  const siteUrl = site ?? new URL('https://ryanchoi.dev');

  return new Response(getRobotsTxt(siteUrl), {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
