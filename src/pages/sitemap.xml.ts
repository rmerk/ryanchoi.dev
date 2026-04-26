import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

const staticRoutes = ['/', '/projects', '/resume', '/about', '/blog'];

interface SitemapUrl {
  loc: string;
  lastmod?: string;
}

function xmlEscape(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export const GET: APIRoute = async ({ site }) => {
  const siteUrl = site ?? new URL('https://ryanchoi.dev');
  const posts = await getCollection('blog', ({ data }) => !data.draft);

  const urls: SitemapUrl[] = [
    ...staticRoutes.map((path) => ({
      loc: new URL(path, siteUrl).href,
    })),
    ...posts.map((post) => ({
      loc: new URL(`/blog/${post.id.replace(/\.md$/, '')}`, siteUrl).href,
      lastmod: post.data.date.toISOString().slice(0, 10),
    })),
  ];

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(({ loc, lastmod }) => `  <url>
    <loc>${xmlEscape(loc)}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
  </url>`)
  .join('\n')}
</urlset>
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
