import {describe, it, expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';

describe('studio vite PWA precache config', () => {
  const viteConfigPath = resolve(
    __dirname,
    '../../../../../apps/studio/vite.config.ts'
  );
  const viteConfigSource = readFileSync(viteConfigPath, 'utf-8');

  it('includes pyodide.mjs in globPatterns', () => {
    expect(viteConfigSource).toContain('pyodide.mjs');
  });

  it('includes pyodide.asm.wasm in globPatterns', () => {
    expect(viteConfigSource).toContain('pyodide.asm.wasm');
  });

  it('includes python_stdlib.zip in globPatterns', () => {
    expect(viteConfigSource).toContain('python_stdlib.zip');
  });

  it('has a maximumFileSizeToCacheInBytes config', () => {
    expect(viteConfigSource).toContain('maximumFileSizeToCacheInBytes');
  });
});
