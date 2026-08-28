import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';

import {SessionStore} from '../../store/SessionStore.js';
import {buildWidget, hasBuiltSource, rebuildWidgetSource} from '../buildWidget.js';

// esbuild resolves bare imports (react, react-dom) by walking up from the
// entry file through ancestor node_modules directories, same as Node — so
// test widget dirs must live under frontend/ (where react is hoisted), not
// os.tmpdir(). authoring-service is itself nested there.
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

function makeWidgetDir(indexTsx: string): string {
  fs.mkdirSync(SCRATCH_ROOT, {recursive: true});
  const dir = fs.mkdtempSync(path.join(SCRATCH_ROOT, 'widget-'));
  scratchDirs.push(dir);
  fs.mkdirSync(path.join(dir, 'src'), {recursive: true});
  fs.writeFileSync(path.join(dir, 'src', 'index.tsx'), indexTsx);
  return dir;
}

describe('hasBuiltSource', () => {
  it('is true when src/index.tsx exists', () => {
    const dir = makeWidgetDir('export {};');
    expect(hasBuiltSource(dir)).toBe(true);
  });

  it('is false for a legacy widget with no src/', () => {
    fs.mkdirSync(SCRATCH_ROOT, {recursive: true});
    const dir = fs.mkdtempSync(path.join(SCRATCH_ROOT, 'widget-'));
    scratchDirs.push(dir);
    fs.writeFileSync(path.join(dir, 'widget.html'), '<!doctype html>');
    expect(hasBuiltSource(dir)).toBe(false);
  });
});

describe('buildWidget', () => {
  it('bundles a JSX entry into one self-contained document', async () => {
    const dir = makeWidgetDir(`
      import {createRoot} from 'react-dom/client';
      function App() {
        return <button className="hi">Hi</button>;
      }
      createRoot(document.getElementById('root')!).render(<App />);
    `);

    const result = await buildWidget(dir, 'Test Widget');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).toContain('<div id="root">');
    expect(result.html).toContain('createRoot');
    expect(result.html).toContain('Test Widget');
    // buildWidgetDocument's own chrome: brand kit + CSP + shim, same as a
    // legacy widget.html gets.
    expect(result.html).toContain('window.McpApp = {');
    expect(result.html).toContain('Content-Security-Policy');
  });

  it('bundles a CSS import transitively into the composed document', async () => {
    const dir = makeWidgetDir(`
      import './styles.css';
      import {createRoot} from 'react-dom/client';
      createRoot(document.getElementById('root')!).render(<div>hi</div>);
    `);
    fs.writeFileSync(
      path.join(dir, 'src', 'styles.css'),
      '.probe-marker { color: red; }',
    );

    const result = await buildWidget(dir, 'CSS Widget');

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.html).toContain('.probe-marker');
  });

  it('reports a readable error and no html on a syntax error', async () => {
    const dir = makeWidgetDir('this is not valid typescript {{{');

    const result = await buildWidget(dir, 'Broken Widget');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorText.length).toBeGreaterThan(0);
  });

  it('reports an error for a missing import rather than throwing', async () => {
    const dir = makeWidgetDir(
      "import {Nope} from 'not-a-real-package';\nconsole.log(Nope);",
    );

    const result = await buildWidget(dir, 'Missing Import Widget');

    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.errorText).toContain('not-a-real-package');
  });
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
