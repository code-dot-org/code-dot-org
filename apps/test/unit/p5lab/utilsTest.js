import {expect} from '../../util/reconfiguredChai';
import {
  parseSoundPathString,
  printerStyleNumberRangeToList,
} from '@cdo/apps/p5lab/utils';
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

describe('the printerStyleNumberRangeToList function', () => {
  it('for a config string containing numbers and ranges, returns number list', () => {
    expect(printerStyleNumberRangeToList('1,2,4-6')).to.eql([1, 2, 4, 5, 6]);
  });
  it('for a config string containing numbers, returns number list', () => {
    expect(printerStyleNumberRangeToList('1,2,4,6')).to.eql([1, 2, 4, 6]);
  });
  it('for a config string containing number ranges, returns number list', () => {
    expect(printerStyleNumberRangeToList('1-3,5-7')).to.eql([1, 2, 3, 5, 6, 7]);
  });
  it('for a config string containing no numbers, returns empty list', () => {
    expect(
      printerStyleNumberRangeToList('&quot;CAT&quot;, &quot;SLOTH&quot;')
    ).to.eql([]);
  });
});
