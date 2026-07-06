import {afterEach, describe, expect, it} from 'vitest';

import {visualProjects} from '../index';

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

  it('tags every project with the @visual grep and disables retries', () => {
    process.env.VISUAL_PROVIDER = 'playwright';
    for (const project of visualProjects({browsers: ['chromium', 'firefox']})) {
      expect(project.grep).toEqual(/@visual/);
      expect(project.retries).toBe(0);
    }
  });
});
