import {DanceSongManifestFilename} from '@cdo/generated-scripts/sharedConstants';

import Sounds from '../Sounds';
import {ageDialogSelectedOver13, songFilterOn} from '../templates/AgeDialog';
import {fetchSignedCookies} from '../utils';

const DEPRECATED_SONGS = [
  'cantfeelmyface_theweeknd',
  'countrygirl_lukebryan',
  'dancinginthedark_brucespringsteen',
  'levelup_ciara',
  'macarena_losdelrio',
  'shapeofyou_edsheeran',
  'somebodylikeyou_keithurban',
  'sorry_justinbieber',
  'wecantstop_mileycyrus',
  'ymca_villagepeople',
  'firework_katyperry',
  'showdaspoderosas_anitta',
  'savagelove_jasonderulo',
  'astronautintheocean_maskedwolf',
  'dernieredanse_indila',
];

/**
 * Requests the song manifest in parallel with signed cloudfront cookies. These cookies
 * are needed before accessing restricted song files.
 * @param useRestrictedSongs {boolean} if true, request signed cloudfront
 * cookies in parallel with the request for the manifest, and use /restricted/
 * urls instead of curriculum.code.org urls for music files.
 * @param manifestFilename {string} Optional. Specify the name of the manifest
 * to request from S3. Must be located in cdo-sound-library/hoc_song_meta.
 * @returns {Promise<*>} The song manifest.
 */
export async function getSongManifest(useRestrictedSongs, manifestFilename) {
  if (!manifestFilename || manifestFilename.length === 0) {
    manifestFilename = useRestrictedSongs
      ? DanceSongManifestFilename
      : 'testManifest.json';
  }

  const songManifestPromise = fetch(
    `/api/v1/sound-library/hoc_song_meta/${manifestFilename}`
  ).then(response => response.json());
  const promises = [songManifestPromise];

  if (useRestrictedSongs) {
    const signedCookiesPromise = fetchSignedCookies();
    promises.push(signedCookiesPromise);
  }

  const result = await Promise.all(promises);
  const songManifest = result[0].songs;

  const songPathPrefix = useRestrictedSongs
    ? '/restricted/'
    : 'https://curriculum.code.org/media/uploads/';

  return songManifest.map(song => ({
    ...song,
    url: `${songPathPrefix}${song.url}.mp3`,
  }));
}

/**
 * Decide which song to select based on the song list and provided options.
 * @param songManifest
 * @param options {Object} set of options that determine which song to select.
 *    These are typically derived from the level and/or project sources.
 * @returns {String} song id to select
 */
export function getSelectedSong(
  songManifest,
  {selectedSong, defaultSong, isProjectLevel, freePlay}
) {
  // The selectedSong and defaultSong might not be present in the songManifest
  // in development mode, so just select the first song in the list instead.
  const songs = songManifest.map(song => song.id);
  if (
    (isProjectLevel || freePlay) &&
    selectedSong &&
    songs.includes(selectedSong)
  ) {
    return selectedSong;
  } else if (defaultSong && songs.includes(defaultSong)) {
    return defaultSong;
  } else if (songManifest[0]) {
    return songManifest[0].id;
  }
}

/**
 * Load the specified song sound file.
 * @param songId {string} Song to load.
 * @param songData {Object<Object>} Song data containing urls of songs.
 * @param onPreloadError {function} Error callback with status code.
 */
export function loadSong(songId, songData, onPreloadError) {
  const url = songData[songId].url;
  const options = {
    id: url,
    mp3: url,
    onPreloadError,
  };
  Sounds.getSingleton().register(options);
}

export function unloadSong(songId, songData) {
  const url = songData[songId].url;

  // Stop playing sound before unloading it. Otherwise, the sound will continue play.
  Sounds.getSingleton().stopPlayingURL(url);
  Sounds.getSingleton().unload(url);
}

export async function loadSongMetadata(id) {
  let songDataPath = '/api/v1/sound-library/hoc_song_meta';
  const response = await fetch(`${songDataPath}/${id}.json`);
  return response.json();
}

export function parseSongOptions(songManifest) {
  let songs = {};
  songManifest.forEach(song => {
    songs[song.id] = {title: song.text, url: song.url, pg13: song.pg13};
  });
  return songs;
}

// Given a songManifest, returns a list of keys that represent the songs to
// be displayed based on whether the song filter is on.
export function getFilteredSongKeys(fullSongManifest, filterOn) {
  const allSongKeys = Object.keys(fullSongManifest);
  if (filterOn) {
    // Filter is on, only include songs that are not pg13.
    return allSongKeys.filter(key => !fullSongManifest[key].pg13);
  }
  // Filter is off, all songs may be displayed.
  return allSongKeys;
}

/**
 * The filter defaults to on. If the user is over 13 (identified via account or anon dialog), filter turns off.
 */
export function getFilterStatus(userType, under13) {
  // Check if song filter override is triggered and initialize song filter to true.
  const songFilter = songFilterOn();
  if (songFilter) {
    return true;
  }

  // userType - 'teacher', 'student', 'unknown' - signed out users.
  // If the user is signed out . . .
  if (userType === 'unknown') {
    // Query session key set from user selection in age dialog.
    // Return false (no filter), if user is over 13.
    return !ageDialogSelectedOver13();
  }

  // User is signed in (student or teacher) and the filter override is not turned on.
  // Return true (filter should be turned on) if the user is under 13. Teachers assumed over13.
  return under13;
}

export function isSongDeprecated(songId) {
  return DEPRECATED_SONGS.includes(songId);
}
