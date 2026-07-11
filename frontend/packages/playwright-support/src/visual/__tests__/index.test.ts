import type {Page} from 'playwright/test';
import {afterEach, describe, expect, it} from 'vitest';

import {assertWebfontsLoaded, visualProjects} from '../index';

describe('assertWebfontsLoaded', () => {
  // evaluate is called twice: fonts.ready, then the errored-family list.
  const fakePage = (errored: string[]): Page => {
    const results: unknown[] = [undefined, errored];
    return {evaluate: async () => results.shift()} as unknown as Page;
  };

  it('passes when no webfont errored', async () => {
    await expect(assertWebfontsLoaded(fakePage([]))).resolves.toBeUndefined();
  });

  it('fails when a webfont errored', async () => {
    await expect(assertWebfontsLoaded(fakePage(['Noto Sans']))).rejects.toThrow(
      /webfonts failed to load/,
    );
  });
});

describe('visualProjects', () => {
  const original = process.env.VISUAL_PROVIDER;

  afterEach(() => {
    if (original === undefined) {
      delete process.env.VISUAL_PROVIDER;
    } else {
      process.env.VISUAL_PROVIDER = original;
    }
  });

  it('returns [] when VISUAL_PROVIDER is unset', () => {
    delete process.env.VISUAL_PROVIDER;
    expect(visualProjects()).toEqual([]);
  });

  it('defaults to chromium-only when a provider is set', () => {
    process.env.VISUAL_PROVIDER = 'playwright';
    expect(visualProjects().map(p => p.name)).toEqual(['visual-chromium']);
  });

  it('honors an explicit browser list, in order', () => {
    process.env.VISUAL_PROVIDER = 'playwright';
    const names = visualProjects({
      browsers: ['chromium', 'firefox', 'webkit'],
    }).map(p => p.name);
    expect(names).toEqual([
      'visual-chromium',
      'visual-firefox',
      'visual-webkit',
    ]);
  });

  it('tags every project with the @visual grep and inherits config retries', () => {
    process.env.VISUAL_PROVIDER = 'playwright';
    for (const project of visualProjects({browsers: ['chromium', 'firefox']})) {
      expect(project.grep).toEqual(/@visual/);
      // No own `retries`: the project inherits the config's value, so a lost
      // font/render race retries like the functional project rather than
      // reddening the job on first miss.
      expect('retries' in project).toBe(false);
    }
  });
});
