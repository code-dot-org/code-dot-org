import {describe, expect, it} from 'vitest';

import {coursesKeys} from '../courses.keys';

describe('coursesKeys cache reuse', () => {
  it('structure key excludes levelPosition', () => {
    const key1 = coursesKeys.structure('oceans', 1);
    expect(key1).toEqual(['courses', 'structure', 'oceans', 1]);
    expect(key1).not.toContain('levelPosition');
  });

  it('levelProperties key excludes levelPosition', () => {
    const key1 = coursesKeys.levelProperties('oceans', 1, 1);
    expect(key1).toEqual(['courses', 'levelProperties', 'oceans', 1, 1]);
    expect(key1).toHaveLength(5);
  });

  it('same lesson produces identical keys regardless of level position', () => {
    const structureKey = coursesKeys.structure('oceans', 1);
    const structureKey2 = coursesKeys.structure('oceans', 1);
    expect(structureKey).toEqual(structureKey2);

    const propsKey = coursesKeys.levelProperties('oceans', 1, 1);
    const propsKey2 = coursesKeys.levelProperties('oceans', 1, 1);
    expect(propsKey).toEqual(propsKey2);
  });

  it('different lessons produce different levelProperties keys', () => {
    const key1 = coursesKeys.levelProperties('oceans', 1, 1);
    const key2 = coursesKeys.levelProperties('oceans', 1, 2);
    expect(key1).not.toEqual(key2);
  });
});
