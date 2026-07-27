// The esbuild resolve/load plugin that turns a learner's path-keyed project
// into a bundle. Proven in spikes/milestone-0/esbuild-spike.mjs; promoted here.
//
// `world-lab` and `phaser` are marked external — the preview supplies them.
// Everything else resolves against the in-memory file map, honoring relative
// (`./x`, `../x`) and project-root-relative (`worlds/x`) specifiers, with
// extension inference, and loads `.ts` / `.js` / `.json` (and `.png` as a data
// URL so the engine can hand it to Phaser's loader without a network fetch).

import type {Loader, Plugin} from 'esbuild-wasm';

const EXTERNALS = new Set(['world-lab', 'phaser']);
const EXT_ORDER = ['', '.ts', '.js', '.json', '/index.ts', '/index.js'];
const NS = 'world-project';

function normalize(path: string): string {
  const parts: string[] = [];
  for (const segment of path.split('/')) {
    if (segment === '' || segment === '.') {
      continue;
    }
    if (segment === '..') {
      parts.pop();
    } else {
      parts.push(segment);
    }
  }
  return parts.join('/');
}

function resolveInProject(
  spec: string,
  importer: string,
  files: ReadonlyMap<string, string>,
): string | null {
  let base: string;
  if (spec.startsWith('./') || spec.startsWith('../')) {
    const dir = importer.includes('/') ? importer.replace(/\/[^/]+$/, '') : '';
    base = normalize(`${dir}/${spec}`);
  } else {
    base = normalize(spec); // project-root-relative, e.g. worlds/platform
  }
  for (const ext of EXT_ORDER) {
    const candidate = `${base}${ext}`;
    if (files.has(candidate)) {
      return candidate;
    }
  }
  return null;
}

function loaderFor(path: string): Loader {
  if (path.endsWith('.ts')) {
    return 'ts';
  }
  if (path.endsWith('.json')) {
    return 'json';
  }
  if (path.endsWith('.png')) {
    return 'dataurl';
  }
  return 'js';
}

/**
 * @param getFiles - returns the current project map (path -> source). Read lazily
 *   so a warm esbuild context sees each rebuild's latest sources.
 */
export function virtualFsPlugin(
  getFiles: () => ReadonlyMap<string, string>,
): Plugin {
  return {
    name: 'world-virtual-fs',
    setup(build) {
      build.onResolve({filter: /.*/}, args => {
        if (EXTERNALS.has(args.path)) {
          return {path: args.path, external: true};
        }
        if (args.kind === 'entry-point') {
          return {path: normalize(args.path), namespace: NS};
        }
        const resolved = resolveInProject(args.path, args.importer, getFiles());
        if (!resolved) {
          return {
            errors: [
              {
                text: `cannot resolve '${args.path}' from '${args.importer}'`,
              },
            ],
          };
        }
        return {path: resolved, namespace: NS};
      });

      build.onLoad({filter: /.*/, namespace: NS}, args => {
        const contents = getFiles().get(args.path);
        if (contents === undefined) {
          return {errors: [{text: `no such project file: ${args.path}`}]};
        }
        return {contents, loader: loaderFor(args.path), resolveDir: '/'};
      });
    },
  };
}
