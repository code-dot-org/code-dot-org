/** The sprite groups the engine treats as platform players: the arrow-key
    player and the W-A-S-D one. The engine and the block code share these so
    neither can rename a group without the other. */
export const PLAYER_GROUP = 'players';
export const PLAYER_2_GROUP = 'players2';

export const isPlayerGroup = (group: string | undefined): boolean =>
  group === PLAYER_GROUP || group === PLAYER_2_GROUP;
