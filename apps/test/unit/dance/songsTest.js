import {expect} from '../../util/reconfiguredChai';
import {getFilteredSongKeys} from '@cdo/apps/dance/songs';

let testSongManifest = {
  allAgesSong: {
    text: 'Singer - Song For Everybody',
    pg13: false,
    url: 'singer_song'
  },
  olderStudentSong: {
    text: 'Band - Song for Older Students',
    pg13: true,
    url: 'band_song'
  }
};

describe('Dance Party Songs Utils', function() {
  describe('Song Filtering', function() {
    it('when filtering is on, should only return keys of songs that are not pg-13', function() {
      let filteredSongs = getFilteredSongKeys(testSongManifest, true);
      expect(filteredSongs.length).to.equal(1);
      expect(filteredSongs[0]).to.equal('allAgesSong');
    });

    it('when filtering is off, all song keys are returned', function() {
      let filteredSongs = getFilteredSongKeys(testSongManifest, false);
      expect(filteredSongs.length).to.equal(2);
      expect(filteredSongs[1]).to.equal('olderStudentSong');
    });
  });
});
