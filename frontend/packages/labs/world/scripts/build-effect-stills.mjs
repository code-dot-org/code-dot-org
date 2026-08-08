// Renders each stock effect's first frame to a PNG, once, at build time.
//
//   yarn build:effect-stills            regenerate src/effect/stock/stills.ts
//   yarn build:effect-stills --check    fail if it is out of date
//
// WHY THIS EXISTS. The picker used to render the stills itself when it opened:
// one offscreen WebGL context, six shaders, six `readPixels`. That works, and
// it makes the pictures a runtime cost paid on every open, on a machine that
// may have no WebGL at all — in which case a learner choosing an effect gets
// words and no pictures, which is the case pictures were added for.
//
// Rendered here they are just images. The dialog needs no GPU to show them, no
// compile, and nothing to go wrong; WebGL is then needed only to ANIMATE the
// one row being looked at, which is an enhancement rather than the feature.
//
// WHY COMMITTED, against the convention next door. `public/` is generated and
// gitignored here (`setup-world-assets.mjs`), and these could have gone the
// same way. They are committed instead because the alternative is a browser in
// the build path: this script drives Playwright, and `yarn setup:world` runs
// wherever the package is built. Six small PNGs in git buy that back, and a
// changed picture shows up in review — which is the right place to notice that
// an edit to a stock effect changed how it looks.
//
// WHY A TS MODULE of data URLs rather than files in `public/`. No asset
// pipeline to agree with: this package is consumed by Vite here and has been
// ported into the webpack build next door, and a `.png` import means two build
// systems have to say yes. A string always works.

import * as esbuild from 'esbuild';
import {execFileSync} from 'node:child_process';
import {readFileSync, writeFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';

const here = dirname(fileURLToPath(import.meta.url));
const pkgRoot = join(here, '..');
const outFile = join(pkgRoot, 'src/effect/stock/stills.ts');

/**
 * Rendered at 2× the 72px the picker draws them at, so they stay sharp on a
 * dense screen without paying for a size nothing displays.
 */
const SIZE = 144;
/** The sample every effect is shown on — warping reads clearly on a grid. */
const TEXTURE = 'checker';

const check = process.argv.includes('--check');

// The page needs the compiler, the preview and the library, and nothing else.
// Bundled rather than imported because they are TypeScript, and run in a
// browser because a shader needs a GPU — there is no Node path to a WebGL
// context that does not involve a native build.
const {outputFiles} = await esbuild.build({
  stdin: {
    contents: `
      import {compileEffect} from './src/effect/compiler/compileEffect';
      import {ShaderPreview} from './src/effect/preview/ShaderPreview';
      import {findTestTexture, renderTestTexture}
        from './src/effect/preview/testTextures';
      import {STOCK_EFFECTS} from './src/effect/stock';

      window.__stills = (size, textureId) => {
        const sample = renderTestTexture(findTestTexture(textureId), size);
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const preview = new ShaderPreview(canvas);
        preview.setTexture(sample);
        const out = {__sample: sample.toDataURL()};
        for (const effect of STOCK_EFFECTS) {
          const compiled = compileEffect(effect.document);
          preview.setFragmentShader(compiled.fragmentSource);
          const parameters = new Map();
          for (const parameter of compiled.parameters) {
            parameters.set(parameter.name, {
              type: parameter.type,
              value: parameter.defaultValue,
            });
          }
          // Frame zero of both clocks, so the column is a fair comparison
          // rather than stills caught at whatever moment each was rendered.
          preview.render(0, 0, parameters);
          out[effect.id] = preview.snapshot();
        }
        preview.dispose();
        return out;
      };
    `,
    resolveDir: pkgRoot,
    loader: 'ts',
  },
  bundle: true,
  format: 'iife',
  write: false,
  platform: 'browser',
});
const script = outputFiles[0].text;

const {chromium} = await import(
  join(pkgRoot, '../../../node_modules/playwright/index.mjs')
);
// SwiftShader, so this renders the same on a build machine with no GPU as on
// one with a good ~ and so the committed pictures do not depend on hardware.
const browser = await chromium.launch({
  args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'],
  // Playwright's own browser by default (`npx playwright install chromium`).
  // `CHROMIUM_PATH` is for a machine that has a headless shell but not that —
  // the same binary, reached differently.
  ...(process.env.CHROMIUM_PATH
    ? {executablePath: process.env.CHROMIUM_PATH}
    : {}),
});
let stills;
try {
  const page = await browser.newPage();
  await page.setContent('<!doctype html><title>stills</title>');
  await page.addScriptTag({content: script});
  stills = await page.evaluate(
    ([size, texture]) => window.__stills(size, texture),
    [SIZE, TEXTURE],
  );
} finally {
  await browser.close();
}

const missing = Object.entries(stills).filter(([, value]) => !value);
if (missing.length) {
  console.error(`could not render: ${missing.map(([id]) => id).join(', ')}`);
  process.exit(1);
}

const entries = Object.entries(stills)
  .filter(([id]) => id !== '__sample')
  .map(([id, data]) => `  ${JSON.stringify(id)}: '${data}',`)
  .join('\n');

const source = `// GENERATED by scripts/build-effect-stills.mjs — do not edit.
//
// The first frame of every stock effect, run over the ${TEXTURE} sample at each
// effect's declared defaults, at ${SIZE}px. The picker shows these; WebGL is
// needed only to ANIMATE the row being looked at (see \`ImportEffectDialog\`).
//
// Regenerate with \`yarn build:effect-stills\` after changing a stock effect,
// the sample, or the compiler. \`--check\` fails when they are out of date.

/** The untouched sample — the reference the effects are read against. */
export const EFFECT_SAMPLE_STILL =
  '${stills.__sample}';

/** One first frame per stock effect, by id. */
export const EFFECT_STILLS: Readonly<Record<string, string>> = {
${entries}
};
`;

// Written by a script, read by everyone: the repo's own formatter decides how
// it looks, so it never shows up as a diff the first time anyone lints. Applied
// BEFORE the comparison too — formatting the file after checking it would make
// `--check` fail on output it had just written.
const formatted = execFileSync(
  'npx',
  ['prettier', '--stdin-filepath', outFile],
  {cwd: pkgRoot, input: source, encoding: 'utf8'},
);

if (check) {
  const current = readFileSync(outFile, 'utf8');
  if (current !== formatted) {
    console.error(
      'effect stills are out of date — run `yarn build:effect-stills`',
    );
    process.exit(1);
  }
  console.log('effect stills: up to date');
} else {
  writeFileSync(outFile, formatted);
  console.log(`effect stills: wrote ${Object.keys(stills).length - 1}`);
}
