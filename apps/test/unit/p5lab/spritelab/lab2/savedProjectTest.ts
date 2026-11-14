import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {
  fromSaved,
  toSaved,
  updateSaved,
} from '@cdo/apps/p5lab/spritelab/lab2/savedProject';
import type {Scene, Sources} from '@cdo/apps/p5lab/spritelab/lab2/types';

const program = (type: string) =>
  ({blocks: {blocks: [{type}]}} as unknown as WorkspaceSerialization);
const scenesOf = (): Scene[] => [
  {id: 'scene-1', name: 'Scene 1', source: program('say')},
  {id: 'scene-2', name: 'The cave'},
];
const ANIMATIONS = {orderedKeys: [], propsByKey: {}};
// A project as it comes off the server: parsed, so no object in it has been
// seen before.
const loaded = (saved: unknown): Sources => JSON.parse(JSON.stringify(saved));

describe('a saved project', () => {
  it('is saved with its scenes inside source, and no top-level program', () => {
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

  it('comes back with its scenes beside an empty source', () => {
    const scenes = scenesOf();
    const sources = fromSaved(
      loaded({source: {scenes}, animations: ANIMATIONS})
    );
    expect(sources.scenes).toEqual(scenes);
    expect(sources.source).toEqual({});
    expect(sources.animations).toEqual(ANIMATIONS);
  });

  it('reads the same project again from what it saved', () => {
    const sources = fromSaved(loaded({source: {scenes: scenesOf()}}));
    expect(fromSaved(loaded(toSaved(sources)))).toEqual(sources);
  });

  it('is read as it is when saved in the earlier shape', () => {
    const earlier: Sources = {source: program('whenRun'), scenes: scenesOf()};
    expect(fromSaved(earlier)).toBe(earlier);
  });

  it('keeps its one program in source while it has no scenes', () => {
    const untouched: Sources = {source: program('whenRun')};
    expect(fromSaved(untouched)).toBe(untouched);
    expect(toSaved(untouched)).toBe(untouched);
  });

  it('reads the scenes inside source when a file holds both', () => {
    const inside = scenesOf();
    const sources = fromSaved(
      loaded({source: {scenes: inside}, scenes: [{id: 'other', name: 'Other'}]})
    );
    expect(sources.scenes).toEqual(inside);
  });
});

describe('an update of the stored project', () => {
  const earlier = (): Sources => ({
    source: program('whenRun'),
    scenes: scenesOf(),
    animations: ANIMATIONS,
  });

  it('leaves a project in the earlier shape alone when nothing changes', () => {
    const stored = earlier();
    expect(updateSaved(stored, sources => sources)).toBe(stored);
    expect(
      updateSaved(stored, sources => ({
        ...sources,
        animations: {orderedKeys: [], propsByKey: {}},
      }))
    ).toBe(stored);
  });

  it('writes the new shape when something in the earlier shape changes', () => {
    const stored = earlier();
    const next = updateSaved(stored, sources => ({
      ...sources,
      scenes: [...(sources.scenes ?? []), {id: 'scene-3', name: 'Scene 3'}],
    }));
    expect(Object.keys(next).sort()).toEqual(['animations', 'source']);
    expect((next.source as {scenes: Scene[]}).scenes.map(s => s.id)).toEqual([
      'scene-1',
      'scene-2',
      'scene-3',
    ]);
  });

  it('leaves a project in the new shape alone when nothing changes', () => {
    const stored = loaded({source: {scenes: scenesOf()}});
    expect(updateSaved(stored, sources => sources)).toBe(stored);
  });

  it('keeps the loaded source object when only a flag changes', () => {
    const stored = loaded({source: {scenes: scenesOf()}});
    const next = updateSaved(stored, sources => ({
      ...sources,
      chosenBlocks: ['burst'],
    }));
    expect(next.chosenBlocks).toEqual(['burst']);
    expect(next.source).toBe(stored.source);
  });

  it('makes a new source object when a scene changes', () => {
    const stored = loaded({source: {scenes: scenesOf()}});
    const next = updateSaved(stored, sources => ({
      ...sources,
      scenes: (sources.scenes ?? []).map(scene =>
        scene.id === 'scene-2' ? {...scene, name: 'The deep cave'} : scene
      ),
    }));
    expect(next.source).not.toBe(stored.source);
    expect((next.source as {scenes: Scene[]}).scenes[1].name).toBe(
      'The deep cave'
    );
  });
});
