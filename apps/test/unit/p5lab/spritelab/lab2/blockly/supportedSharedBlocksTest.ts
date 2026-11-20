import {filterToSupportedSharedBlocks} from '@cdo/apps/p5lab/spritelab/lab2/blockly/toolbox/supportedSharedBlocks';

describe('filterToSupportedSharedBlocks', () => {
  it('keeps supported blocks in pool order', () => {
    expect(
      filterToSupportedSharedBlocks({
        Sprites: [
          'gamelab_spriteSay',
          'gamelab_glideTo',
          'gamelab_moveForward',
        ],
      })
    ).toEqual({Sprites: ['gamelab_spriteSay', 'gamelab_moveForward']});
  });

  it('drops a category whose blocks are all unsupported', () => {
    expect(
      filterToSupportedSharedBlocks({
        Experimental: ['gamelab_setupScoreboard', 'gamelab_startFollowing'],
        Events: ['gamelab_atTime'],
      })
    ).toEqual({Events: ['gamelab_atTime']});
  });
});
