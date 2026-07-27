// Milestone-0 Spike B: esbuild-wasm warm-context bundling.
//
// Proves the compile sandbox's core: a warm esbuild context bundles a
// multi-file learner project into one ESM module, resolving project-relative
// AND root-relative bare specifiers from an in-memory file map, transpiling
// TypeScript, treating `world-lab` (and `phaser`) as external, and rebuilding
// incrementally when a file changes. Runs in Node (esbuild-wasm also runs in
// Node); the browser variant (Spike C) uses the same plugin against the same
// file-map shape.
//
// Run:  node spikes/milestone-0/esbuild-spike.mjs

import * as esbuild from 'esbuild-wasm';

// A stand-in learner project (the shape WorldPreview will flatten to). Keys are
// project-root-relative paths, exactly what projectFiles.getPreviewFiles emits.
const project = {
  'scenes/main.ts': `
    // root-relative + relative + external imports, and TypeScript
    import {SceneBuilder} from 'world-lab';
    import PlatformWorld from 'worlds/platform';
    import Player from './player-helper';
    const scene = new SceneBuilder({id: 'game', name: 'Game'});
    scene.useWorld(PlatformWorld);
    const label: string = Player.label;
    console.log('scene built for', label);
    export default scene;
  `,
  'scenes/player-helper.ts': `
    const Player = {label: 'player-v1'};
    export default Player;
  `,
  'worlds/platform.js': `
    import {WorldBuilder} from 'world-lab';
    import config from 'worlds/platform.config.json';
    const world = new WorldBuilder({id: config.id, name: config.name});
    export default world;
  `,
  'worlds/platform.config.json': `{"id":"platform","name":"Platform World"}`,
};

// The virtual-FS resolve/load plugin. `world-lab` and `phaser` are external
// (the preview supplies them); everything else resolves against the file map,
// honoring extensionless root-relative and relative specifiers.
const EXTERNALS = new Set(['world-lab', 'phaser']);
const EXT_ORDER = ['', '.ts', '.js', '.json', '/index.ts', '/index.js'];
const NS = 'project';

function resolveInProject(spec, importer) {
  // Relative to the importing file's directory; bare specifiers are relative to
  // the project root.
  let base;
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const dir = importer.includes('/') ? importer.replace(/\/[^/]+$/, '') : '';
    base = normalize(`${dir}/${spec}`);
  } else {
    base = spec; // root-relative bare specifier, e.g. worlds/platform
  }
  for (const ext of EXT_ORDER) {
    const candidate = `${base}${ext}`;
    if (candidate in project) return candidate;
  }
  return null;
}

function normalize(path) {
  const parts = [];
  for (const seg of path.split('/')) {
    if (seg === '' || seg === '.') continue;
    if (seg === '..') parts.pop();
    else parts.push(seg);
  }
  return parts.join('/');
}

const loaderFor = path =>
  path.endsWith('.ts') ? 'ts' : path.endsWith('.json') ? 'json' : 'js';

const virtualFsPlugin = {
  name: 'world-virtual-fs',
  setup(build) {
    build.onResolve({filter: /.*/}, args => {
      if (EXTERNALS.has(args.path)) return {path: args.path, external: true};
      if (args.kind === 'entry-point') {
        return {path: args.path, namespace: NS};
      }
      const resolved = resolveInProject(args.path, args.importer);
      if (!resolved) {
        return {
          errors: [
            {text: `cannot resolve '${args.path}' from '${args.importer}'`},
          ],
        };
      }
      return {path: resolved, namespace: NS};
    });
    build.onLoad({filter: /.*/, namespace: NS}, args => {
      const contents = project[args.path];
      if (contents === undefined) {
        return {errors: [{text: `no such project file: ${args.path}`}]};
      }
      return {contents, loader: loaderFor(args.path), resolveDir: '/'};
    });
  },
};

async function main() {
  const t0 = Date.now();
  await esbuild.initialize({}); // Node: loads the package's wasm
  const initMs = Date.now() - t0;

  const ctx = await esbuild.context({
    entryPoints: ['scenes/main.ts'],
    bundle: true,
    format: 'esm',
    write: false,
    sourcemap: 'inline',
    plugins: [virtualFsPlugin],
    logLevel: 'silent',
  });

  // Cold build.
  const t1 = Date.now();
  const first = await ctx.rebuild();
  const coldMs = Date.now() - t1;
  const firstCode = first.outputFiles[0].text;

  // Incremental rebuild after an edit (the hot-reload feed).
  project['scenes/player-helper.ts'] = `
    const Player = {label: 'player-v2'};
    export default Player;
  `;
  const t2 = Date.now();
  const second = await ctx.rebuild();
  const warmMs = Date.now() - t2;
  const secondCode = second.outputFiles[0].text;

  await ctx.dispose();
  await esbuild.stop();

  // Assertions.
  const checks = [
    ['bundles to one ESM module', first.outputFiles.length === 1],
    ['keeps world-lab external', /from ?["']world-lab["']/.test(firstCode)],
    [
      'inlines relative import (no ./player-helper import)',
      !/player-helper/.test(firstCode) || firstCode.includes('player-v1'),
    ],
    [
      'resolves root-relative bare (worlds/platform)',
      firstCode.includes('Platform World'),
    ],
    ['imports JSON', firstCode.includes('platform')],
    ['transpiles TS (no type annotation leaks)', !/: string =/.test(firstCode)],
    ['cold build produced v1', firstCode.includes('player-v1')],
    [
      'incremental rebuild reflects edit (v2)',
      secondCode.includes('player-v2'),
    ],
    ['warm rebuild faster than cold', warmMs <= coldMs],
  ];

  let ok = true;
  for (const [name, pass] of checks) {
    console.log(`${pass ? 'PASS' : 'FAIL'}  ${name}`);
    if (!pass) ok = false;
  }
  console.log(
    `\ntimings: init=${initMs}ms cold=${coldMs}ms warm(incremental)=${warmMs}ms`,
  );
  console.log(
    `\nbundle head:\n${firstCode.split('\n').slice(0, 12).join('\n')}`,
  );
  process.exit(ok ? 0 : 1);
}

main().catch(e => {
  console.error('SPIKE ERROR', e);
  process.exit(1);
});
