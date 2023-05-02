import {expect} from '../../util/reconfiguredChai';
import {DEFAULT_SOUND} from '@cdo/apps/blockly/constants';
import * as utils from '@cdo/apps/p5lab/utils';
const {parsePathString} = utils;

describe('the parsePathString function', () => {
  it('returns ', () => {
    expect(
      parsePathString('sound://category_board_games/card_dealing_multiple.mp3')
    ).to.equal('Board games: card_dealing_multiple');
  });

  it('returns ', () => {
    expect(parsePathString('sound://default.mp3')).to.equal('default');
  });

  it('returns DEFAULT_SOUND when not a valid sound file path', () => {
    expect(parsePathString('Choose')).to.equal(DEFAULT_SOUND);
  });
});
