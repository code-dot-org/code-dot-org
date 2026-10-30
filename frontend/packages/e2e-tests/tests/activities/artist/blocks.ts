/**
 * Blockly workspace JSON fixtures for the Artist lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution: move forward, turn right 90 degrees, move forward again. */
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

/** Losing solution: move forward, then a restricted turn that doesn't solve the puzzle. */
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
