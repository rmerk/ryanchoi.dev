// integrations/measure-assets.mjs
// Measures the built output and substitutes the real byte counts into the emitted
// HTML, so /colophon can state what the site actually ships instead of asserting it.
//
// A prior design note rejected this as impossible — "Astro renders HTML before the
// asset is finalised". That is not so: Astro's static build sequences the SSR build,
// then the client build, then page generation, and the CSS plugin registers for both
// targets, so stylesheets exist on disk two phases before any HTML is written. The
// HTML even embeds the CSS content hash, which could not be true if the content were
// still in flux. `astro:build:done` runs after everything is emitted.
//
// The genuine hazard is self-reference: writing a byte count into a page changes that
// page's byte count. This is handled by substituting FIXED-WIDTH tokens — every
// replacement is padded with leading spaces to exactly the token's length, so the
// files are the same size before and after, and a total measured before substitution
// is still true after it. HTML collapses leading whitespace, so nothing shows.
//
// The alternative — committing a measurements JSON and reading it on the next build —
// was rejected: pass N would describe pass N-1's assets, so every change would ship
// one stale deploy. That is exactly the silent rot the site's data rule exists to
// prevent.
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

// Must stay in step with the tokens emitted by src/pages/colophon.astro. Drift is not
// silent: any token declared here and not found in the output fails the build.
const TOKEN_WIDTH = 14;
const token = (key) => `@@${key.padEnd(TOKEN_WIDTH - 4, '_')}@@`;

async function walk(dir) {
  const found = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) found.push(...(await walk(path)));
    else found.push(path);
  }
  return found;
}

const bytes = (n) => `${n.toLocaleString('en-US')} B`;

// Pluralised here rather than in the template: the page emits a fixed-width token and
// only learns the count after the build, so it cannot choose between singular and
// plural itself. Emitting the whole phrase avoids a "1 stylesheet(s)" in the output.
const count = (n, singular, plural = `${singular}s`) => `${n} ${n === 1 ? singular : plural}`;

export default function measureAssets() {
  return {
    name: 'measure-assets',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const root = fileURLToPath(dir);
        const files = await walk(root);

        const sized = await Promise.all(
          files.map(async (path) => ({ path, size: (await stat(path)).size }))
        );

        const sum = (predicate) =>
          sized.filter(predicate).reduce((total, file) => total + file.size, 0);

        const isExt = (ext) => (file) => extname(file.path) === ext;

        const cssBytes = sum(isExt('.css'));
        const jsBytes = sum(isExt('.js'));
        const htmlFiles = sized.filter(isExt('.html'));
        const htmlBytes = htmlFiles.reduce((total, file) => total + file.size, 0);

        const values = {
          CSSBYTES: bytes(cssBytes),
          JSBYTES: bytes(jsBytes),
          HTMLBYTES: bytes(htmlBytes),
          CODEBYTES: bytes(cssBytes + jsBytes + htmlBytes),
          CSSFILES: count(sized.filter(isExt('.css')).length, 'stylesheet'),
          JSFILES: count(sized.filter(isExt('.js')).length, 'file'),
          ROUTECOUNT: String(htmlFiles.length),
        };

        for (const [key, value] of Object.entries(values)) {
          if (value.length > TOKEN_WIDTH) {
            throw new Error(
              `measure-assets: "${value}" for ${key} is ${value.length} characters and will not fit the ${TOKEN_WIDTH}-character token. Widen TOKEN_WIDTH in both this file and colophon.astro.`
            );
          }
        }

        let substitutions = 0;
        const seen = new Set();

        await Promise.all(
          htmlFiles.map(async ({ path }) => {
            const original = await readFile(path, 'utf8');
            let next = original;

            for (const [key, value] of Object.entries(values)) {
              const needle = token(key);
              if (!next.includes(needle)) continue;
              seen.add(key);
              // padStart to the token's exact length keeps the file byte-identical in
              // size, which is what makes the HTML total measured above still correct.
              next = next.replaceAll(needle, value.padStart(TOKEN_WIDTH, ' '));
            }

            if (next === original) return;

            if (next.length !== original.length) {
              throw new Error(
                `measure-assets: substitution changed the size of ${path} (${original.length} to ${next.length}). The published byte counts would be wrong.`
              );
            }

            substitutions += 1;
            await writeFile(path, next, 'utf8');
          })
        );

        const missing = Object.keys(values).filter((key) => !seen.has(key));
        if (missing.length > 0 && substitutions > 0) {
          throw new Error(
            `measure-assets: no page emitted a token for ${missing.join(', ')}. colophon.astro and this integration have drifted apart.`
          );
        }

        if (substitutions === 0) {
          logger.warn('no page emitted measurement tokens; nothing was substituted');
        } else {
          logger.info(
            `measured ${values.ROUTECOUNT} routes: ${values.CSSBYTES} CSS, ${values.JSBYTES} JS, ${values.HTMLBYTES} HTML`
          );
        }
      },
    },
  };
}
