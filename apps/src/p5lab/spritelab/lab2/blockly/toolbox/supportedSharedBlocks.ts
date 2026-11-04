// Filter the shared blocks to only those supported by Sprite Lab in lab2.
// If existing blocks from the shared pools become supported by Sprite Lab,
// they should be added here.

export const SUPPORTED_SHARED_BLOCK_TYPES: ReadonlySet<string> = new Set([
  'gamelab_setBackground',
  'gamelab_setBackgroundImageAs',
  'gamelab_setForegroundEffect',
  'gamelab_setPrompt',
  'gamelab_setPromptWithChoices',

  'gamelab_allSpritesWithAnimation',
  'gamelab_makeBurst',
  'gamelab_makeNewSpriteAnon',
  'gamelab_makeSpritesGrid',
  'gamelab_moveBackward',
  'gamelab_moveForward',
  'gamelab_moveInDirection',
  'gamelab_setProp',
  'gamelab_spriteSay',
  'gamelab_spriteSayTime',

  'gamelab_location_picker',

  'gamelab_atTime',
  'gamelab_checkTouching',
  'gamelab_spriteClicked',
  'gamelab_whenPromptAnswered',

  'gamelab_addBehaviorSimple',
]);

/** The pool's category map filtered to its supported blocks; an empty category
    is dropped. */
export function filterToSupportedSharedBlocks(blocksByCategory: {
  [category: string]: string[];
}): {[category: string]: string[]} {
  return Object.fromEntries(
    Object.entries(blocksByCategory)
      .map(([category, types]): [string, string[]] => [
        category,
        types.filter(type => SUPPORTED_SHARED_BLOCK_TYPES.has(type)),
      ])
      .filter(([, types]) => types.length > 0)
  );
}
