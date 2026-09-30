import {describe, expect, it} from 'vitest';

import {ProjectSourcesSchema} from '../sources.schemata';

describe('ProjectSourcesSchema', () => {
  it("keeps a lab's own keys beside source", () => {
    const sources = {
      source: '{}',
      scenes: [{id: 'scene-1', name: 'Scene 1'}],
      animations: {orderedKeys: [], propsByKey: {}},
    };
    expect(ProjectSourcesSchema.parse(sources)).toEqual(sources);
  });

  it('takes a Blockly workspace kept as an object', () => {
    const sources = {source: {blocks: {blocks: [{type: 'when_run'}]}}};
    expect(ProjectSourcesSchema.parse(sources)).toEqual(sources);
  });

  it('still requires source', () => {
    expect(ProjectSourcesSchema.safeParse({scenes: []}).success).toBe(false);
  });
});
