import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {fromSaved, toSaved} from '@cdo/apps/p5lab/spritelab/lab2/savedProject';
import type {Scene, Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';

const program = (type: string) =>
  ({blocks: {blocks: [{type}]}} as unknown as WorkspaceSerialization);
const scenesOf = (): Scene[] => [
  {id: 'scene-1', name: 'Scene 1', source: program('say')},
  {id: 'scene-2', name: 'The cave'},
];
const ANIMATIONS = {orderedKeys: [], propsByKey: {}};

describe('a saved project', () => {
  it('is saved with its scenes inside source', () => {
    const scenes = scenesOf();
    const saved = toSaved({
      source: program('whenRun'),
      scenes,
      animations: ANIMATIONS,
      chosenBlocks: ['burst'],
    });
    expect(saved).toEqual({
      source: {scenes},
      animations: ANIMATIONS,
      chosenBlocks: ['burst'],
    });
    expect('scenes' in saved).toBe(false);
  });

  it('comes back with its scenes beside source', () => {
    const scenes = scenesOf();
    const saved = {
      source: {scenes},
      animations: ANIMATIONS,
    } as unknown as Sources;
    const loaded = fromSaved(saved);
    expect(loaded.scenes).toBe(scenes);
    expect(loaded.source).toEqual({});
    expect(loaded.animations).toBe(ANIMATIONS);
  });

  it('survives a save and a load unchanged', () => {
    const scenes = scenesOf();
    const once = fromSaved(toSaved({source: {}, scenes, chosenBlocks: []}));
    expect(once).toEqual({source: {}, scenes, chosenBlocks: []});
    expect(toSaved(once)).toEqual({source: {scenes}, chosenBlocks: []});
  });

  it('is read as it is when saved in the earlier shape, and saved in the new', () => {
    const scenes = scenesOf();
    const earlier: Sources = {source: program('whenRun'), scenes};
    expect(fromSaved(earlier)).toBe(earlier);
    expect(toSaved(fromSaved(earlier))).toEqual({source: {scenes}});
  });

  it('keeps its one program in source while it has no scenes', () => {
    const untouched: Sources = {source: program('whenRun')};
    expect(fromSaved(untouched)).toBe(untouched);
    expect(toSaved(untouched)).toBe(untouched);
  });

  it('keeps the same source object while its scenes do not change', () => {
    const scenes = scenesOf();
    const first = toSaved({source: {}, scenes});
    const loaded = fromSaved(first);
    const flagged = toSaved({...loaded, chosenBlocks: ['burst']});
    expect(flagged.source).toBe(first.source);
    const edited = toSaved({...loaded, scenes: [...scenes]});
    expect(edited.source).not.toBe(first.source);
  });
});
