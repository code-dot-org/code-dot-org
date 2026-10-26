// What a world's CODE says about its cameras, for the map editor's Cameras
// panel (specs/SPACE_CAMERAS_PLAN.md).
//
// The world's cameras are made in the map editor and kept as data on its main
// map (`mapModel`, `blockly/placementCameras`). A world written before that —
// or one whose author declared a camera in blocks — still has `define camera`
// rows under `define world`; the panel lists those as "in code", and reads
// from here which camera the code starts the world looking through, for the
// world whose map says nothing about it.

import {cameraBlockId} from '../blockly/cameras';

/** What the world starts looking through when nothing says otherwise. */
export const MAIN_CAMERA = 'main';

/** One property of a camera trait, as a camera's inspector edits it. */
export interface CameraProperty {
  /** The `set` block's type, which is how a value is found. */
  setter: string;
  name: string;
  /** `actor`, `number`, `boolean`, `point` or `vector`. */
  type: string;
}

interface Block {
  type?: string;
  fields?: Record<string, unknown>;
  next?: {block?: Block};
}

/**
 * Which camera the world's CODE starts it looking through: the block id its
 * first `look through camera` row under `define world` names, or
 * `MAIN_CAMERA`.
 */
export function startingCamera(contents: string): string {
  let root: Block | undefined;
  try {
    root = (
      JSON.parse(contents) as {blocks?: {blocks?: Block[]}}
    ).blocks?.blocks?.find(block => block?.type === 'world_world');
  } catch {
    return MAIN_CAMERA;
  }
  for (let row = root?.next?.block; row; row = row.next?.block) {
    if (row.type === 'world_use_camera') {
      return cameraBlockId(String(row.fields?.CAMERA ?? '')) || MAIN_CAMERA;
    }
  }
  return MAIN_CAMERA;
}
