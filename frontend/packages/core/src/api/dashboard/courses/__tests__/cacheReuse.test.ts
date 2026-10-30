import {describe, expect, it} from 'vitest';

import {coursesKeys} from '../courses.keys';

describe('coursesKeys cache reuse', () => {
  it('structure key excludes levelPosition', () => {
    const key1 = coursesKeys.structure('oceans', 1);
    expect(key1).toEqual(['courses', 'structure', 'oceans', 1]);
    expect(key1).not.toContain('levelPosition');
  });

  it('same lesson produces identical structure keys regardless of level position', () => {
    const structureKey = coursesKeys.structure('oceans', 1);
    const structureKey2 = coursesKeys.structure('oceans', 1);
    expect(structureKey).toEqual(structureKey2);
  });

  it('different units produce different structure keys', () => {
    const key1 = coursesKeys.structure('oceans', 1);
    const key2 = coursesKeys.structure('oceans', 2);
    expect(key1).not.toEqual(key2);
  });
});
