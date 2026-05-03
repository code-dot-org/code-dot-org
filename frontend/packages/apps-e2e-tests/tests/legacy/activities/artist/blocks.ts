/**
 * Blockly workspace JSON fixtures for the Artist lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution for level 2: move forward 100, turn right 90, move forward 100. */
export const WINNING_ARTIST_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 32,
        y: 32,
        next: {
          block: {
            type: 'draw_move_by_constant',
            fields: {
              DIR: '<field name="DIR">moveForward</field>',
              VALUE: '100',
            },
            next: {
              block: {
                type: 'draw_turn_by_constant_dropdown',
                fields: {
                  DIR: '<field name="DIR">turnRight</field>',
                  VALUE:
                    '<field name="VALUE" config="45,60,90,120,180">90</field>',
                },
                next: {
                  block: {
                    type: 'draw_move_by_constant',
                    fields: {
                      DIR: '<field name="DIR">moveForward</field>',
                      VALUE: '100',
                    },
                  },
                },
              },
            },
          },
        },
      },
    ],
  },
};

/** Losing solution for level 2: move forward, turn right with restricted block — misses the goal. */
export const LOSING_ARTIST_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'draw_move_by_constant',
            fields: {
              DIR: '<field name="DIR">moveForward</field>',
              VALUE: '100',
            },
            next: {
              block: {
                type: 'draw_turn_by_constant_restricted',
                fields: {
                  DIR: '<field name="DIR">turnRight</field>',
                  VALUE: '<field name="VALUE">90</field>',
                },
              },
            },
          },
        },
      },
    ],
  },
};
