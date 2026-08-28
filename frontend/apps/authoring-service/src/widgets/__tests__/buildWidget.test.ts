import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';

import {SessionStore} from '../../store/SessionStore.js';
import {rebuildWidgetSource} from '../buildWidget.js';

// esbuild resolves bare imports (react, react-dom) by walking up from the
// entry file through ancestor node_modules directories, same as Node — so
// scratch session roots must live under frontend/ (where react is hoisted),
// not os.tmpdir(). authoring-service is itself nested there. The esbuild
// call itself is exercised directly in @code-dot-org/widgets-catalog's own
// buildWidget.test.ts; these tests cover only this package's SessionStore
// wrapper (rebuildWidgetSource) and its contract-gate wiring.
const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  '..',
);
const SCRATCH_ROOT = path.join(PACKAGE_ROOT, '.tmp-build-widget-test');

const scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function makeSessionStore(): {store: SessionStore; widgetId: string} {
  fs.mkdirSync(SCRATCH_ROOT, {recursive: true});
  const root = fs.mkdtempSync(path.join(SCRATCH_ROOT, 'session-'));
  scratchDirs.push(root);
  return {store: new SessionStore(root), widgetId: 'gate-probe'};
}

function writeEntry(store: SessionStore, widgetId: string, indexTsx: string) {
  const srcDir = path.join(store.widgetDir(widgetId), 'src');
  fs.mkdirSync(srcDir, {recursive: true});
  fs.writeFileSync(path.join(srcDir, 'index.tsx'), indexTsx);
}

describe('rebuildWidgetSource contract-gate wiring', () => {
  it('writes widget.html for a build that passes every gate', async () => {
    const {store, widgetId} = makeSessionStore();
    writeEntry(
      store,
      widgetId,
      `
      import {createRoot} from 'react-dom/client';
      function App() {
        return (
          <button
            id="go"
            onClick={() => McpApp.updateModelContext({structuredContent: {event: 'completed'}})}
          >
            Go
          </button>
        );
      }
      createRoot(document.getElementById('root')!).render(<App />);
    `,
    );

    const result = await rebuildWidgetSource(store, widgetId, 'Gate probe');

    expect(result?.ok).toBe(true);
    expect(store.readWidgetSource(widgetId)).toBeDefined();
    expect(
      fs.existsSync(path.join(store.widgetDir(widgetId), 'build-errors.txt')),
    ).toBe(false);
  });

  it('refuses a build that violates the contract gates, with an actionable reason', async () => {
    const {store, widgetId} = makeSessionStore();
    writeEntry(
      store,
      widgetId,
      `
      import {createRoot} from 'react-dom/client';
      fetch('/anything');
      createRoot(document.getElementById('root')!).render(<div>hi</div>);
    `,
    );

    const result = await rebuildWidgetSource(store, widgetId, 'Gate probe');

    expect(result?.ok).toBe(false);
    if (!result || result.ok) return;
    expect(result.errorText).toContain('contract gate violations');
    expect(result.errorText).toContain('network reference found: fetch(');
    // widget.html is left untouched — the same guarantee a build failure gives.
    expect(store.readWidgetSource(widgetId)).toBeUndefined();
    expect(
      fs.readFileSync(
        path.join(store.widgetDir(widgetId), 'build-errors.txt'),
        'utf8',
      ),
    ).toContain('network reference found: fetch(');
  });
});
