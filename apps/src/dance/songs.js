import Sounds from "../Sounds";

export async function getSongManifest(useRestrictedSongs) {
  const manifestFilename = useRestrictedSongs ? 'songManifest.json' : 'testManifest.json';
  const songManifestPromise = fetch(`/api/v1/sound-library/hoc_song_meta/${manifestFilename}`)
    .then(response => response.json());
  const promises = [songManifestPromise];

  // We must obtain signed cookies before accessing restricted content.
  if (useRestrictedSongs) {
    const signedCookiesPromise = fetch('/dashboardapi/sign_cookies', {credentials: 'same-origin'});
    promises.push(signedCookiesPromise);
  }

  const result = await Promise.all(promises);
  const songManifest = result[0].songs;

  const songPathPrefix = useRestrictedSongs ?
    '/restricted/' : 'https://curriculum.code.org/media/uploads/';

  return songManifest.map(song => ({
    ...song,
    url: `${songPathPrefix}${song.url}.mp3`,
  }));
}

/**
 * Decide which song to select based on the song list and appOptions config.
 * @param songManifest
 * @param config {Object} appOptions config object
 * @returns {String} song id to select
 */
export function getSelectedSong(songManifest, config) {
  // The selectedSong and defaultSong might not be present in the songManifest
  // in development mode, so just select the first song in the list instead.
  const songs = songManifest.map(song => song.id);
  const {selectedSong, defaultSong, isProjectLevel, freePlay} = config.level;
  if ((isProjectLevel || freePlay) && selectedSong && songs.includes(selectedSong)) {
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
 */
export function loadSong(songId, songData) {
  const options = {
    id: songId,
    mp3: songData[songId].url,
  };
  Sounds.getSingleton().register(options);
}

export async function loadSongMetadata(id) {
  let songDataPath = '/api/v1/sound-library/hoc_song_meta';
  const response = await fetch(`${songDataPath}/${id}.json`);
  return response.json();
}

export function parseSongOptions(songManifest) {
  let songs = {};
  songManifest.forEach((song) => {
    songs[song.id] = {title: song.text, url: song.url};
  });
  return songs;
}


