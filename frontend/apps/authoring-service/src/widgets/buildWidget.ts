import fs from 'node:fs';
import path from 'node:path';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';
import {
  buildWidget,
  checkWidgetDocument,
  hasBuiltSource,
  type BuildWidgetResult,
} from '@code-dot-org/widgets-catalog';

import type {SessionStore} from '../store/SessionStore.js';

export type {BuildWidgetResult, BuildWidgetSuccess, BuildWidgetFailure} from '@code-dot-org/widgets-catalog';
export {hasBuiltSource};

const BUILD_ERRORS_FILE = 'build-errors.txt';

/**
 * Rebuilds one widget if it uses the built (src/) path, writing widget.html
 * on success and a `build-errors.txt` the agent's prompt names on failure.
 * A failed build never touches widget.html — the learner keeps seeing the
 * last good build while the agent (or a human editor) fixes the source.
 * Returns `undefined` for a legacy widget (no src/): the caller should fall
 * through to its pre-existing behavior untouched.
 *
 * The esbuild call itself (`buildWidget`) lives in `@code-dot-org/widgets-catalog`
 * so this session-store-aware wrapper and that package's own `buildCatalog()`
 * share the ONE build configuration — see that package's README.
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
