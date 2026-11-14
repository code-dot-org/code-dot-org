import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {withoutTopLevelSource} from '@cdo/apps/p5lab/spritelab/lab2/topLevelSource';
import type {Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';

const program = (type: string) =>
  ({blocks: {blocks: [{type}]}} as unknown as WorkspaceSerialization);

describe('withoutTopLevelSource', () => {
  it('empties the top-level source of a project with scenes', () => {
    const scenes = [{id: 'scene-1', name: 'Scene 1', source: program('say')}];
    const sources: Sources = {source: program('whenRun'), scenes};

    const result = withoutTopLevelSource(sources);

    expect(result.source).toEqual({});
    expect(result.scenes).toBe(scenes);
    expect(sources.source).toEqual(program('whenRun'));
  });

  it('keeps the one program of a project with no scenes', () => {
    const sources: Sources = {source: program('whenRun')};
    expect(withoutTopLevelSource(sources)).toBe(sources);
    const noScenes: Sources = {source: program('whenRun'), scenes: []};
    expect(withoutTopLevelSource(noScenes)).toBe(noScenes);
  });

  it('returns the same object once the source is empty', () => {
    const sources = withoutTopLevelSource({
      source: program('whenRun'),
      scenes: [{id: 'scene-1', name: 'Scene 1'}],
    });
    expect(withoutTopLevelSource(sources)).toBe(sources);
  });
});
