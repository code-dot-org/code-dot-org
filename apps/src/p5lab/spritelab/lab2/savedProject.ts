// A saved project keeps its scenes inside `source`, where every lab keeps a
// student's work. While it runs, the lab keeps them beside `source`. Only
// this module knows both shapes.

import {isEqual} from 'lodash';

import {unpackSources} from './packedWorld';
import type {Scene, Sources} from './types';

type ScenesSource = {scenes: Scene[]};

const holdsScenes = (source: unknown): source is ScenesSource =>
  !!source &&
  typeof source === 'object' &&
  Array.isArray((source as ScenesSource).scenes);

// In the lab's shape, `source` is empty once the scenes hold every program.
const NO_PROGRAM: Sources['source'] = {};

// Remembers the saved `source` object for each list of scenes, so that an
// update which leaves the scenes alone saves the very same object. The lab
// counts an update as a student's edit when a top-level key is replaced, so
// a new `source` object each time would make every update look like one.
const savedSourceOf = new WeakMap<Scene[], ScenesSource>();

/** A stored project in the shape the lab works with. A level's start
    sources, and a project with no scenes yet, are in that shape already. */
export function fromSaved(saved: Sources): Sources {
  const source: unknown = saved.source;
  if (!holdsScenes(source)) {
    return saved;
  }
  savedSourceOf.set(source.scenes, source);
  return {...saved, source: NO_PROGRAM, scenes: source.scenes};
}

/** The lab's project in the shape it is saved in. A project with no scenes
    yet keeps its one program in `source`. */
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
  return {...rest, source};
}

/** One update of the stored project: `update` runs on the lab's shape and
    its result is stored in the saved shape. An update that changes nothing
    returns the stored project itself, so a project in the earlier shape is
    rewritten only when something in it changes. */
export function updateSaved(
  saved: Sources,
  update: (sources: Sources) => Sources
): Sources {
  const sources = unpackSources(fromSaved(saved));
  const updated = update(sources);
  return isEqual(updated, sources) ? saved : toSaved(updated);
}
