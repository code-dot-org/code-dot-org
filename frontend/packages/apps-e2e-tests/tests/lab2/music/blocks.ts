/**
 * Blockly workspace JSON fixtures for Music Lab (lesson 46 of allthethingscourse).
 *
 * Format matches `startSources.blocks` in the level config files under
 * `dashboard/config/levels/custom/music/`. Pass to `MusicLab.loadBlocks()`.
 *
 * Source: Music Level 1 — "First, please play one sound."
 * Validation passes with `played_sounds_together: 1`.
 */
export const WINNING_MUSIC_LEVEL_2_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        id: 'when-run-block',
        type: 'when_run_simple2',
        deletable: false,
        movable: false,
        x: 34,
        y: 34,
        next: {
          block: {
            id: 'play_sound_at_current_location_simple2',
            type: 'play_sound_at_current_location_simple2',
            fields: {
              sound: 'disco_beat',
            },
          },
        },
      },
    ],
  },
  variables: [{name: 'currentTime'}, {name: 'i'}],
};
