import {expect} from '../../util/reconfiguredChai';
import * as utils from '@cdo/apps/p5lab/utils';
const {parseSoundPathString} = utils;
import {SOUND_PREFIX} from '@cdo/apps/assetManagement/assetPrefix';

describe('the parseSoundPathString function', () => {
  it('for a valid path to sound file, returns a user-friendly sound name with category', () => {
    expect(
      parseSoundPathString(
        `${SOUND_PREFIX}category_board_games/card_dealing_multiple.mp3`
      )
    ).to.equal('Board games: card_dealing_multiple');
  });

  it('for a valid path to sound file, returns a user-friendly sound name when no category is included', () => {
    expect(parseSoundPathString(`${SOUND_PREFIX}default.mp3`)).to.equal(
      'default'
    );
  });

  it('for an invalid path to sound file, throws an error', () => {
    const errMsg = 'This is not a valid path to a sound file.';
    expect(() => {
      parseSoundPathString('sound');
    }).to.throw(Error, errMsg);
  });

  it('for an invalid path to sound file (no mp3 file extension), throws an error', () => {
    const errMsg = 'This is not a valid path to a sound file.';
    expect(() => {
      parseSoundPathString(`${SOUND_PREFIX}default`);
    }).to.throw(Error, errMsg);
  });

  it('for an invalid path to sound file (does not begin with sound://), throws an error', () => {
    const errMsg = 'This is not a valid path to a sound file.';
    expect(() => {
      parseSoundPathString('default.mp3');
    }).to.throw(Error, errMsg);
  });
});
