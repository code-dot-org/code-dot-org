import sinon from 'sinon'; // eslint-disable-line no-restricted-imports
import {StubFunction} from 'test/types/types';

import {getFilteredSongKeys, getFilterStatus} from '@cdo/apps/dance/songs';
import * as AgeDialog from '@cdo/apps/templates/AgeDialog';

import {expect} from '../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

const testSongManifest = {
  allAgesSong: {
    text: 'Singer - Song For Everybody',
    pg13: false,
    url: 'singer_song',
  },
  olderStudentSong: {
    text: 'Band - Song for Older Students',
    pg13: true,
    url: 'band_song',
  },
};

describe('Dance Party Songs Utils', function () {
  describe('Song Filtering', function () {
    it('when filtering is on, should only return keys of songs that are not pg-13', function () {
      const filteredSongs = getFilteredSongKeys(testSongManifest, true);
      expect(filteredSongs.length).to.equal(1);
      expect(filteredSongs[0]).to.equal('allAgesSong');
    });

    it('when filtering is off, all song keys are returned', function () {
      const filteredSongs = getFilteredSongKeys(testSongManifest, false);
      expect(filteredSongs.length).to.equal(2);
      expect(filteredSongs[1]).to.equal('olderStudentSong');
    });
  });

  describe('getFilterStatus', () => {
    describe('getFilterStatus', () => {
      let songFilterOn: StubFunction<typeof AgeDialog.songFilterOn>;
      let ageDialogSelectedOver13: StubFunction<
        typeof AgeDialog.ageDialogSelectedOver13
      >;

      beforeEach(() => {
        songFilterOn = sinon.stub(AgeDialog, 'songFilterOn');
        ageDialogSelectedOver13 = sinon.stub(
          AgeDialog,
          'ageDialogSelectedOver13'
        );
      });

      afterEach(() => {
        sinon.restore();
      });

      it('returns true if the song filter is on', () => {
        songFilterOn.returns(true);
        expect(getFilterStatus('student', true)).to.be.true;
      });

      it('checks age dialog session key if user type is unknown', () => {
        songFilterOn.returns(false);

        ageDialogSelectedOver13.returns(true);
        expect(getFilterStatus('unknown', false)).to.be.false;

        ageDialogSelectedOver13.returns(false);
        expect(getFilterStatus('unknown', false)).to.be.true;
      });

      it('defaults to under13 value if user is signed in', () => {
        songFilterOn.returns(false);

        expect(getFilterStatus('teacher', true)).to.be.true;
        expect(getFilterStatus('student', false)).to.be.false;
      });
    });
  });
});
