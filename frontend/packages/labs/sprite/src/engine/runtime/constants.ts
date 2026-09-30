/** @file The Sprite Lab constants the runtime uses. */

// Big numbers in some blocks can cause performance issues. Combined with live-preview,
// this results in hanging the tab and students unable to edit their blocks. We
// guard against this by capping number of sprites.
// The sprite cap is MAX_NUM_SPRITES, and a workspace alert will be dispatched
// at (MAX_NUM_SPRITES - SPRITE_WARNING_BUFFER) number of sprites.
export const MAX_NUM_SPRITES = 1000;
export const SPRITE_WARNING_BUFFER = 1;
export const MAX_NUM_TEXTS = 1000;
