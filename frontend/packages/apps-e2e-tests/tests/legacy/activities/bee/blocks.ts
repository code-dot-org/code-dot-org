/**
 * Blockly workspace JSON fixtures for the Bee lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Winning solution for level 4: repeat-3 move forward, then collect nectar when amount equals 1. */
export const WINNING_BEE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        id: 'AP;28]6Q8Q{IuPRO!Et@',
        x: 16,
        y: 16,
        deletable: false,
        movable: false,
        extraState: {},
        next: {
          block: {
            type: 'controls_repeat_dropdown',
            id: 'B,oYg{6VhYF3_.B2Fx6D',
            fields: {TIMES: '<field name="TIMES" config="3-10">3</field>'},
            inputs: {
              DO: {
                block: {type: 'maze_moveForward', id: 'is`0CmOudl^S_O!ubIdB'},
              },
            },
            next: {
              block: {
                type: 'bee_ifNectarAmount',
                id: 'ifNectar',
                fields: {
                  ARG1: '<field name="ARG1">nectarRemaining</field>',
                  OP: '<field name="OP">==</field>',
                  ARG2: '1',
                },
                inputs: {
                  DO: {block: {type: 'maze_nectar', id: 'getNectar'}},
                },
              },
            },
          },
        },
      },
    ],
  },
};

/** Recommended solution for level 5: repeat-2 move forward + conditional collect nectar. */
export const RECOMMENDED_BEE_LEVEL_5_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'controls_repeat',
            fields: {TIMES: 2},
            inputs: {
              DO: {
                block: {
                  type: 'maze_moveForward',
                  next: {
                    block: {
                      type: 'bee_ifNectarAmount',
                      fields: {
                        ARG1: '<field name="ARG1">nectarRemaining</field>',
                        OP: '<field name="OP">==</field>',
                        ARG2: '1',
                      },
                      inputs: {
                        DO: {block: {type: 'maze_nectar'}},
                      },
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
