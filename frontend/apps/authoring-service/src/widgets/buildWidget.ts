import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

import {
  buildWidgetDocument,
  injectWidgetChrome,
} from '@code-dot-org/widget-runtime/chrome';

import type {SessionStore} from '../store/SessionStore.js';

import {checkWidgetDocument} from './contractGates.js';

export interface BuildWidgetSuccess {
  ok: true;
  html: string;
}

export interface BuildWidgetFailure {
  ok: false;
  errorText: string;
}

export type BuildWidgetResult = BuildWidgetSuccess | BuildWidgetFailure;

const ENTRY_RELATIVE = path.join('src', 'index.tsx');
const BUILD_ERRORS_FILE = 'build-errors.txt';

/**
 * `widgets/<id>/src/index.tsx` presence is the whole switch between the two
 * widget authoring paths: present means a built (TSX + real
 * component-library) widget, absent means the legacy single-file
 * widget.html an agent (or a human) writes directly. Nothing else in the
 * store, the serve path, or WidgetFrame needs to know which one it is.
 */
export function hasBuiltSource(widgetDir: string): boolean {
  return fs.existsSync(path.join(widgetDir, ENTRY_RELATIVE));
}

/**
 * Bundles a widget's TSX source into one self-contained document via
 * esbuild, then hands the result to `buildWidgetDocument` — the same
 * assembly legacy hand-written widgets go through at serve time — so a
 * built widget.html is shaped identically to a legacy one; only the content
 * differs. `injectWidgetChrome` (unchanged) still runs at serve/publish
 * time on top of whatever this writes.
 *
 * Bundles react, react-dom, and @code-dot-org/component-library — CSS
 * included — into one iife + one CSS blob. component-library's per-component
 * CSS is NOT reachable through its declared package.json `exports` subpaths
 * (e.g. `./button/index.css` names a dist file that does not exist —
 * verified on disk, not assumed from the manifest); it reaches the bundle
 * because each component's compiled JS (e.g. `GenericButton.mjs`) imports
 * its own `*.module.scss.mjs` shim, which itself does `import
 * './genericButton.css'` as a side effect. A widget only needs to import the
 * component itself (`@code-dot-org/component-library/button`); esbuild's
 * `.css` loader follows that transitive import automatically.
 */
export async function buildWidget(
  widgetDir: string,
  title: string,
): Promise<BuildWidgetResult> {
  try {
    const result = await esbuild.build({
      entryPoints: [path.join(widgetDir, ENTRY_RELATIVE)],
      bundle: true,
      write: false,
      outdir: 'out', // virtual: write:false means nothing actually lands here
      absWorkingDir: widgetDir,
      format: 'iife',
      platform: 'browser',
      target: 'es2020',
      jsx: 'automatic',
      minify: false,
      loader: {'.css': 'css'},
      logLevel: 'silent',
      // React and MUI (which component-library wraps) both gate large
      // dev-only blocks — verbose console warnings, extra prop-type checks —
      // behind `process.env.NODE_ENV !== 'production'`. Defining it lets
      // esbuild's dead-code elimination drop those blocks entirely, which
      // matters twice over here: those warnings are packed with
      // https://reactjs.org/link/... URLs that would otherwise read as
      // network references to a host scanning the built document (they are
      // inert text, never fetched, but indistinguishable from a real
      // reference by a static string check), and the dead blocks are a
      // meaningful share of a widget's size budget. Widget code itself is
      // still unminified (minify stays false) — this narrows dead branches,
      // it does not rename or compress anything.
      define: {'process.env.NODE_ENV': '"production"'},
    });
    let js = '';
    let css = '';
    for (const file of result.outputFiles) {
      if (file.path.endsWith('.css')) css += file.text;
      else if (file.path.endsWith('.js')) js += file.text;
    }
    const html = buildWidgetDocument({
      title,
      css,
      bodyHtml: '<div id="root"></div>',
      js,
    });
    return {ok: true, html};
  } catch (error) {
    return {ok: false, errorText: formatBuildError(error)};
  }
}

function formatBuildError(error: unknown): string {
  const errors = (error as {errors?: esbuild.Message[]} | undefined)?.errors;
  if (!errors || errors.length === 0) {
    return error instanceof Error ? error.message : String(error);
  }
  return errors
    .map(e => {
      const loc = e.location
        ? `${e.location.file}:${e.location.line}:${e.location.column}`
        : undefined;
      return loc ? `${loc}: ${e.text}` : e.text;
    })
    .join('\n');
}

/**
 * Rebuilds one widget if it uses the built (src/) path, writing widget.html
 * on success and a `build-errors.txt` the agent's prompt names on failure.
 * A failed build never touches widget.html — the learner keeps seeing the
 * last good build while the agent (or a human editor) fixes the source.
 * Returns `undefined` for a legacy widget (no src/): the caller should fall
 * through to its pre-existing behavior untouched.
 */
export async function rebuildWidgetSource(
  store: SessionStore,
  widgetId: string,
  title: string,
): Promise<BuildWidgetResult | undefined> {
  const dir = store.widgetDir(widgetId);
  if (!hasBuiltSource(dir)) {
    return undefined;
  }
  const result = gateBuild(await buildWidget(dir, title));
  const errorsFile = path.join(dir, BUILD_ERRORS_FILE);
  if (result.ok) {
    store.writeWidgetSource(widgetId, result.html);
    fs.rmSync(errorsFile, {force: true});
  } else {
    fs.writeFileSync(errorsFile, `${result.errorText}\n`);
  }
  return result;
}

/**
 * A syntactically clean build can still violate the contract gates (a
 * network call, no McpApp.updateModelContext report, positive tabindex, an
 * onclick on a non-interactive tag, ...) — checked against the SERVED
 * document (post injectWidgetChrome), same shape GET /api/widgets/:id and
 * /publish check. Folded into BuildWidgetResult's existing failure case
 * rather than a third outcome: a gate violation is treated exactly like an
 * esbuild error by every caller downstream (widget.html untouched,
 * build-errors.txt written, the PostToolUse hook feeds the reason back to
 * the agent) — the only difference is what produced errorText.
 */
function gateBuild(result: BuildWidgetResult): BuildWidgetResult {
  if (!result.ok) {
    return result;
  }
  const violations = checkWidgetDocument(injectWidgetChrome(result.html));
  if (violations.length === 0) {
    return result;
  }
  return {
    ok: false,
    errorText: `Widget contract gate violations:\n${violations
      .map(v => `- ${v}`)
      .join('\n')}`,
  };
}
