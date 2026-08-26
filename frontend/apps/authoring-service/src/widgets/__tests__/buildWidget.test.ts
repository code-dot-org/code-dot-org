import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {afterEach, describe, expect, it} from 'vitest';

import {buildWidget, hasBuiltSource} from '../buildWidget.js';

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
