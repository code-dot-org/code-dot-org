import {withoutLocks} from '@cdo/apps/p5lab/spritelab/lab2/blockLocks';

describe('withoutLocks', () => {
  it('drops the locks from every block but when-run, through inputs and next', () => {
    const source = {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_whenRun',
            deletable: false,
            movable: false,
            next: {
              block: {
                type: 'gamelab_spriteSay',
                deletable: false,
                movable: false,
                inputs: {
                  SPRITE: {
                    block: {type: 'x', deletable: false, movable: false},
                    shadow: {type: 'gamelab_allSpritesWithAnimation'},
                  },
                },
              },
            },
          },
          {type: 'gamelab_atTime', deletable: false, movable: false},
        ],
      },
    };
    expect(withoutLocks(source)).toEqual({
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: 'spritelab2_whenRun',
            deletable: false,
            movable: false,
            next: {
              block: {
                type: 'gamelab_spriteSay',
                inputs: {
                  SPRITE: {
                    block: {type: 'x'},
                    shadow: {type: 'gamelab_allSpritesWithAnimation'},
                  },
                },
              },
            },
          },
          {type: 'gamelab_atTime'},
        ],
      },
    });
  });

  it('leaves a source with no blocks alone', () => {
    const source = {blocks: {languageVersion: 0}};
    expect(withoutLocks(source)).toBe(source);
  });
});
