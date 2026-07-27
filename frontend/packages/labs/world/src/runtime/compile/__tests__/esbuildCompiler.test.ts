// @vitest-environment node
// esbuild-wasm requires the real Node TextEncoder/Uint8Array realm; jsdom's
// (the package's default) trips its environment invariant, so run this in Node.
import {afterAll, describe, expect, it} from 'vitest';

import {CompileError, WorldCompiler} from '../esbuildCompiler';

// esbuild-wasm runs in Node here (no wasmURL); the browser path is exercised by
// spikes/milestone-2. One shared compiler — `initialize` is a one-per-thread
// singleton.
const compiler = new WorldCompiler();

afterAll(() => compiler.dispose());

const PROJECT: Record<string, string> = {
  'scenes/main.ts': `
    import {SceneBuilder} from 'world-lab';
    import PlatformWorld from 'worlds/platform';
    import label from './label';
    const scene = new SceneBuilder({id: 'game', name: 'Game'});
    scene.useWorld(PlatformWorld);
    const tag: string = label;
    console.log('built', tag);
    export default scene;
  `,
  'scenes/label.ts': `export default 'v1';`,
  'worlds/platform.js': `
    import {WorldBuilder} from 'world-lab';
    import config from 'worlds/platform.config.json';
    export default new WorldBuilder({id: config.id, name: config.name});
  `,
  'worlds/platform.config.json': `{"id":"platform","name":"Platform World"}`,
};

describe('WorldCompiler', () => {
  it('bundles a multi-file project to one ESM module', async () => {
    const code = await compiler.compile(PROJECT, 'scenes/main.ts');
    // world-lab is rewritten to its self-hosted URL (external), not bundled.
    expect(code).toMatch(/from ?["']\/vendor\/world-lab\.mjs["']/);
    expect(code).not.toContain('SceneBuilder =');
    // Root-relative + relative + JSON imports were inlined.
    expect(code).toContain('Platform World');
    expect(code).toContain('v1');
    // TypeScript annotations are gone.
    expect(code).not.toMatch(/: string =/);
  });

  it('reflects an edit on a subsequent (warm) rebuild', async () => {
    await compiler.compile(PROJECT, 'scenes/main.ts');
    const edited = {...PROJECT, 'scenes/label.ts': `export default 'v2';`};
    const code = await compiler.compile(edited, 'scenes/main.ts');
    expect(code).toContain('v2');
    expect(code).not.toContain("'v1'");
  });

  it('throws a CompileError with a location for an unresolved import', async () => {
    const broken = {
      'scenes/main.ts': `import x from 'worlds/missing'; export default x;`,
    };
    await expect(compiler.compile(broken, 'scenes/main.ts')).rejects.toThrow(
      CompileError,
    );
    await expect(compiler.compile(broken, 'scenes/main.ts')).rejects.toThrow(
      /cannot resolve 'worlds\/missing'/,
    );
  });
});
