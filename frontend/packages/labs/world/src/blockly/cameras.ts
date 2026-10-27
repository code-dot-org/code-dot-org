// Naming a camera from a block (specs/VIEWPORT.md).
//
// A Viewport's cameras are data on its placement (`placementCameras`), named
// by `shows through` and nothing in the code, so the one camera a block's
// dropdown names is the main one.

import {DEFAULT_CAMERA_ID} from '../engine/core/Camera';

/**
 * The engine-side id for a stored camera.
 *
 * Prefixed so it can never collide with {@link DEFAULT_CAMERA_ID}, exactly as
 * a layer's is.
 */
export const cameraId = (storedId: string): string =>
  `camera_${storedId.replaceAll(/[^A-Za-z0-9_]/g, '')}`;

/** The `[label, value]` rows a CAMERA dropdown offers. */
export const cameraOptions = (): Array<[string, string]> => [
  ['the main camera', DEFAULT_CAMERA_ID],
];

/** The runtime camera id a CAMERA dropdown's value names. */
export const cameraIdFromValue = (value: string): string =>
  value || DEFAULT_CAMERA_ID;
