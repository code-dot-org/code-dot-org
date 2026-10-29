import {describe, expect, it} from 'vitest';

import {oceansCourseFixtures} from '../fixtures';

describe('oceansCourseFixtures', () => {
  // Importing the module already ran every fixtureFactory.wire() parse — a
  // schema drift would throw on import and fail this file. These assertions
  // pin the shape the course route depends on.
  it('serves script structure and a level-properties map', () => {
    const paths = oceansCourseFixtures.map(r => r.path);
    expect(paths).toContain('*/s/oceans/lessons/1/level_properties');
    expect(paths.some(p => p.includes('script_structure'))).toBe(true);
  });

  it('builds a level-properties entry per lesson level', () => {
    const levelProps = oceansCourseFixtures.find(
      r => r.path === '*/s/oceans/lessons/1/level_properties',
    );
    expect(Object.keys(levelProps!.respond as object)).toHaveLength(8);
  });
});
