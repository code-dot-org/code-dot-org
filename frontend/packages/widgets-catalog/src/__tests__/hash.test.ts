import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {afterEach, describe, expect, it} from 'vitest';

import {hashWidgetDoc, hashWidgetSource} from '../hash.js';

const scratchDirs: string[] = [];

afterEach(() => {
  for (const dir of scratchDirs.splice(0)) {
    fs.rmSync(dir, {recursive: true, force: true});
  }
});

function makeSrcDir(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'hash-widget-source-'));
  scratchDirs.push(dir);
  for (const [relPath, contents] of Object.entries(files)) {
    const full = path.join(dir, relPath);
    fs.mkdirSync(path.dirname(full), {recursive: true});
    fs.writeFileSync(full, contents);
  }
  return dir;
}

describe('hashWidgetSource', () => {
  it('is a sha256:<hex> string', () => {
    const dir = makeSrcDir({'index.tsx': 'export {};'});
    expect(hashWidgetSource(dir)).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('is deterministic for the same tree', () => {
    const a = makeSrcDir({'index.tsx': 'export {};', 'data.ts': 'x'});
    const b = makeSrcDir({'index.tsx': 'export {};', 'data.ts': 'x'});
    expect(hashWidgetSource(a)).toBe(hashWidgetSource(b));
  });

  it('is order-independent (directory read order does not leak in)', () => {
    const a = makeSrcDir({'a.ts': '1', 'z.ts': '2'});
    const b = makeSrcDir({'z.ts': '2', 'a.ts': '1'});
    expect(hashWidgetSource(a)).toBe(hashWidgetSource(b));
  });

  it('changes when a file changes content', () => {
    const before = hashWidgetSource(makeSrcDir({'index.tsx': 'export {};'}));
    const after = hashWidgetSource(
      makeSrcDir({'index.tsx': 'export const x = 1;'}),
    );
    expect(before).not.toBe(after);
  });

  it('changes when a file is renamed with identical bytes elsewhere', () => {
    const original = hashWidgetSource(makeSrcDir({'a.ts': 'same'}));
    const renamed = hashWidgetSource(makeSrcDir({'b.ts': 'same'}));
    expect(original).not.toBe(renamed);
  });

  it('includes nested directories', () => {
    const flat = hashWidgetSource(makeSrcDir({'a.ts': 'x'}));
    const nested = hashWidgetSource(makeSrcDir({'sub/a.ts': 'x'}));
    expect(flat).not.toBe(nested);
  });
});

describe('hashWidgetDoc', () => {
  it('is a sha256:<hex> string', () => {
    expect(hashWidgetDoc('<html></html>')).toMatch(/^sha256:[0-9a-f]{64}$/);
  });

  it('is deterministic for the same document', () => {
    expect(hashWidgetDoc('<html>hi</html>')).toBe(
      hashWidgetDoc('<html>hi</html>'),
    );
  });

  it('changes when the document changes', () => {
    expect(hashWidgetDoc('<html>a</html>')).not.toBe(
      hashWidgetDoc('<html>b</html>'),
    );
  });
});
