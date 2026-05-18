/**
 * Blockly workspace JSON fixtures for the Maze lab.
 * Source: dashboard/test/ui/features/step_definitions/blockly_initialization_blocks.rb
 */

/** Valid solution for level 5: forever loop with move-forward and left-turn conditional. */
export const VALID_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {
          block: {
            type: 'maze_forever',
            inputs: {
              DO: {
                block: {
                  type: 'maze_moveForward',
                  next: {
                    block: {
                      type: 'maze_if',
                      fields: {DIR: '<field name="DIR">isPathLeft</field>'},
                      inputs: {
                        DO: {
                          block: {
                            type: 'maze_turn',
                            fields: {
                              DIR: '<field name="DIR">turnLeft</field>',
                            },
                          },
                        },
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

/** Incorrect solution for level 4: two move-forward blocks — falls short of the goal. */
export const INCORRECT_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        id: 'topBlock',
        x: 16,
        y: 16,
        deletable: false,
        movable: false,
        extraState: {},
        next: {
          block: {
            type: 'maze_moveForward',
            id: '0fMt9!PN~r8.U^.[R5Jx',
            next: {
              block: {type: 'maze_moveForward', id: '(bj.Kv_B%TuKOVjE3*!R'},
            },
          },
        },
      },
    ],
  },
};

/** Incorrect solution for level 4: a forever block with no inner blocks. */
export const EMPTY_REPEAT_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        x: 16,
        y: 16,
        next: {block: {type: 'maze_forever'}},
      },
    ],
  },
};

/** Suboptimal solution for level 4: five sequential move-forward blocks; only 3 needed. */
export const TOO_MANY_MAZE_BLOCKS = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'when_run',
        id: 'topBlock',
        x: 16,
        y: 16,
        deletable: false,
        movable: false,
        extraState: {},
        next: {
          block: {
            type: 'maze_moveForward',
            id: '0fMt9!PN~r8.U^.[R5Jx',
            next: {
              block: {
                type: 'maze_moveForward',
                id: 'crJS]gF?%Nvoak,U[Olb',
                next: {
                  block: {
                    type: 'maze_moveForward',
                    id: 'p!vQKVp)~}Kg%mks-YK_',
                    next: {
                      block: {
                        type: 'maze_moveForward',
                        id: 'l?ru=(Q+F^Lke5V`0FAK',
                        next: {
                          block: {
                            type: 'maze_moveForward',
                            id: '-3En4!~AH~T8BNOYE=(h',
                          },
                        },
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
