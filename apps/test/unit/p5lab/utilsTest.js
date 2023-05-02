import {expect} from '../../util/reconfiguredChai';
import * as utils from '@cdo/apps/p5lab/utils';
const {parsePathString} = utils;

describe('the parsePathString function', () => {
  it('for a valid path to sound file, returns a user-friendly sound name with category', () => {
    expect(
      parsePathString('sound://category_board_games/card_dealing_multiple.mp3')
    ).to.equal('Board games: card_dealing_multiple');
  });

  it('for a valid path to sound file, returns a user-friendly sound name when no category is included', () => {
    expect(parsePathString('sound://default.mp3')).to.equal('default');
  });

  it('for an invalid path to sound file, throws an error', () => {
    const errMsg = 'This is not a valid path to a sound file.';
    expect(() => {
      parsePathString('sound');
    }).to.throw(Error, errMsg);
  });
});
