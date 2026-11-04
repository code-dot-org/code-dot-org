// Sprite Lab 2 runs only some of the blocks in the pools a level loads
// (GamelabJr, GameDev), so the complete toolbox offers the types listed
// here and drops the rest.
//
// Blocks a level already uses still install,
// and still render — this only decides what the toolbox offers.

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
