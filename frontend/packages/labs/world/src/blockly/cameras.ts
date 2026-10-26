// Naming a camera from a block (specs/VIEWPORT.md).
//
// The layer file's twin, and deliberately the same shape: a camera declared in
// a workspace is referred to by the ID OF ITS DEFINING BLOCK, not by its name,
// so renaming one breaks nothing. Rules are named by string and needed
// `renameRule` plus `renameMemberReferences` to carry a rename through every
// reference; a world's own actors and layers are referred to by block id and
// needed neither.
//
// Unlike layers, cameras are NOT resolved by containment. A layer holds the
// blocks that place into it, so `set background` can mean "the layer I am
// written in"; a camera holds nothing, so every block that means one has to
// say which — a dropdown, like `within layer`'s.

import type {Blockly} from '@code-dot-org/blockly';

import {DEFAULT_CAMERA_ID} from '../engine/core/Camera';

import {liveDropdown} from './moduleOptions';
import {hasIndexedBlock, indexedBlocksOfType} from './workspaceIndex';

/** Marks a dropdown value as naming a camera defined in this workspace. */
const PREFIX = 'camera:';

export const DEFINE_CAMERA = 'world_define_camera';

/** What a CAMERA dropdown stores for a camera defined in this workspace. */
export const cameraValue = (blockId: string): string => `${PREFIX}${blockId}`;

/** The defining block's id, or undefined if this value names no camera. */
export const cameraBlockId = (value: string): string | undefined =>
  value.startsWith(PREFIX) ? value.slice(PREFIX.length) : undefined;

/**
 * The engine-side id for a camera defined by a block.
 *
 * Prefixed so it can never collide with {@link DEFAULT_CAMERA_ID}, exactly as
 * a layer's is.
 */
export const cameraId = (blockId: string): string =>
  `camera_${blockId.replaceAll(/[^A-Za-z0-9_]/g, '')}`;

const workspaceOf = (field?: Blockly.Field): Blockly.Workspace | undefined => {
  const workspace = field?.getSourceBlock()?.workspace as
    | (Blockly.WorkspaceSvg & {targetWorkspace?: Blockly.Workspace})
    | undefined;
  return workspace?.isFlyout ? workspace.targetWorkspace : workspace;
};

/**
 * Every camera defined in this file, in the order the blocks are in — asked
 * of the index, since a `define camera` may sit in a body held unbuilt
 * (`workspaceIndex`, and `layers.layersIn` on why that matters).
 */
export const camerasIn = (
  workspace: Blockly.Workspace | undefined,
): Array<{blockId: string; name: string}> =>
  indexedBlocksOfType(workspace, DEFINE_CAMERA, true).map(block => ({
    blockId: block.id,
    name: String(block.getFieldValue('NAME') ?? ''),
  }));

/**
 * The world's cameras made in the map editor: data on its main map, not
 * blocks in its code (`placementCameras`), but cameras the code may still
 * look through. Refreshed from the project with the other registries.
 */
let storedCameras: Array<{blockId: string; name: string}> = [];

export function setStoredCameras(
  cameras: ReadonlyArray<{blockId: string; name: string}>,
): void {
  storedCameras = [...cameras];
}

/** The `[label, value]` rows a CAMERA dropdown offers. */
export const cameraOptions = (
  field?: Blockly.FieldDropdown,
): Array<[string, string]> => {
  const declared = camerasIn(workspaceOf(field));
  const rows = [
    ...declared,
    ...storedCameras.filter(
      stored => !declared.some(each => each.blockId === stored.blockId),
    ),
  ].map(
    ({blockId, name}) =>
      [name || 'Camera', cameraValue(blockId)] as [string, string],
  );
  // A dropdown with no options cannot be built, and a world that declares none
  // still has the one every world has.
  return rows.length ? rows : [['the main camera', DEFAULT_CAMERA_ID]];
};

/**
 * The runtime camera id a dropdown's value names.
 *
 * Two shapes reach this, as with layers: a `camera:<blockId>` chosen from the
 * list, and the bare default offered when a workspace declares none. A value
 * naming a definition that has since been deleted resolves to the default — the
 * value outlives the block, and a view through no camera is not an answer.
 */
export const cameraIdFromValue = (
  block: Blockly.Block,
  value: string,
): string => {
  const blockId = cameraBlockId(value);
  // `undefined` means the value is not a camera reference at all — the bare
  // default. An EMPTY id means it is one, naming nothing, which is the deleted
  // case and must not be mistaken for the bare default.
  if (blockId === undefined) {
    return value || DEFAULT_CAMERA_ID;
  }
  return blockId &&
    (hasIndexedBlock(block.workspace, blockId) ||
      storedCameras.some(stored => stored.blockId === blockId))
    ? cameraId(blockId)
    : DEFAULT_CAMERA_ID;
};

/** The CAMERA dropdown, rebuilt from the workspace's own `define camera`s. */
export const cameraOptionsExtension = liveDropdown(
  'world_camera_options',
  'CAMERA',
  cameraOptions,
);
