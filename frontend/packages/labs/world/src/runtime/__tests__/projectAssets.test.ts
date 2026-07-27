// @vitest-environment jsdom
import {describe, expect, it, vi} from 'vitest';

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {projectAssets} from '../projectAssets';

const source = (files: Record<string, ProjectFile>): MultiFileSource => ({
  files,
  folders: {},
  openFiles: [],
});

describe('projectAssets', () => {
  it('ignores text files (no url)', async () => {
    const assets = await projectAssets(
      source({
        a: {
          id: 'a',
          name: 'main.js',
          language: 'javascript',
          contents: 'x',
          folderId: '0',
        },
      }),
    );
    expect(assets).toEqual({});
  });

  it('fetches uploaded files and inlines them as data URLs, keyed by name', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      blob: async () =>
        new Blob([new Uint8Array([137, 80, 78, 71])], {type: 'image/png'}),
    }) as unknown as typeof fetch;

    const assets = await projectAssets(
      source({
        hero: {
          id: 'hero',
          name: 'hero.png',
          language: 'png',
          contents: '',
          folderId: '0',
          url: '/v3/assets/c/abc.png',
          mimeType: 'image/png',
        },
      }),
    );

    expect(Object.keys(assets)).toEqual(['hero.png']);
    expect(assets['hero.png']).toMatch(/^data:image\/png;base64,/);
    expect(global.fetch).toHaveBeenCalledWith('/v3/assets/c/abc.png');
  });
});
