// The shape a project is saved in, as against the shape the lab
// works with. Saved, a project's scenes live inside `source`, where every
// lab keeps a student's work:
//
//   {source: {scenes: [...]}, animations, chosenBlocks, ...}
//
// In the lab they sit beside it, as they always have:
//
//   {source, scenes: [...], animations, chosenBlocks, ...}
//
// The two functions here are the only code that knows both shapes. A level's
// start sources, and a project saved before this, are in the second shape
// and are read as they are; the next save writes the first.

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import type {Scene, Sources} from './types';

/** What `source` holds in a saved project that has scenes. A later `shared`
    key could hold code every scene runs. */
interface ScenesSource {
  scenes: Scene[];
}

const holdsScenes = (source: unknown): source is ScenesSource =>
  !!source &&
  typeof source === 'object' &&
  Array.isArray((source as ScenesSource).scenes);

// The lab's own `source` once the scenes hold every program.
const NO_PROGRAM = {} as WorkspaceSerialization;

// The saved `source` object each list of scenes came from or was last saved
// in, so that a change which leaves the scenes alone leaves `source` the
// same object: the lab tells a student's edit from a saved flag by which
// keys changed.
const savedSourceOf = new WeakMap<Scene[], ScenesSource>();

/** A saved project in the shape the lab works with. */
export function fromSaved(saved: Sources): Sources {
  const source: unknown = saved.source;
  if (!holdsScenes(source)) {
    return saved;
  }
  savedSourceOf.set(source.scenes, source);
  return {...saved, source: NO_PROGRAM, scenes: source.scenes};
}

/** The lab's project in the shape it is saved in. A project with no scenes
    yet keeps its one program in `source`, where the lab reads it as its
    first scene. */
export function toSaved(sources: Sources): Sources {
  const {scenes, ...rest} = sources;
  if (!scenes?.length) {
    return sources;
  }
  let source = savedSourceOf.get(scenes);
  if (!source) {
    source = {scenes};
    savedSourceOf.set(scenes, source);
  }
  return {...rest, source: source as unknown as Sources['source']};
}
