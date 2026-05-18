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

/** Autorun visual fixture: procedure draws a square twice with a turn between. */
export const ARTIST_AUTORUN_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'procedures_callnoreturn',
            extraState: {name: 'draw a square'},
            next: {
              block: {
                type: 'draw_turn_by_constant',
                fields: {
                  DIR: '<field name="DIR">turnRight</field>',
                  VALUE: 90,
                },
                next: {
                  block: {
                    type: 'procedures_callnoreturn',
                    extraState: {name: 'draw a square'},
                  },
                },
              },
            },
          },
        },
      },
      {
        type: 'procedures_defnoreturn',
        x: 31,
        y: 200,
        extraState: {procedureId: 'Y#CwUBj4x2-@q[[-cnCn'},
        fields: {NAME: 'draw a square'},
        inputs: {
          STACK: {
            block: {
              type: 'controls_repeat',
              deletable: false,
              editable: false,
              fields: {TIMES: 4},
              inputs: {
                DO: {
                  block: {
                    type: 'draw_move_by_constant',
                    id: 'rSJg`0XlA5u]7@#jSctv',
                    deletable: false,
                    editable: false,
                    fields: {
                      DIR: '<field name="DIR">moveForward</field>',
                      VALUE: '100',
                    },
                    next: {
                      block: {
                        type: 'draw_turn_by_constant',
                        id: '#C%7cLw=1KH%hZ`RM$NU',
                        deletable: false,
                        editable: false,
                        fields: {
                          DIR: '<field name="DIR">turnRight</field>',
                          VALUE: 90,
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        movable: true,
      },
    ],
  },
  procedures: [
    {
      id: 'Y#CwUBj4x2-@q[[-cnCn',
      name: 'draw a square',
      returnTypes: null,
    },
  ],
};
