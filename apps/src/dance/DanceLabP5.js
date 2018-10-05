/* global p5 */

let fft, peakDetect, customPeakDetects, songs, song_meta;

// Songs
var songs_data = {
  macklemore: {
    url: 'https://curriculum.code.org/media/uploads/chu.mp3',
    bpm: 146,
    delay: 0.2, // Seconds to delay before calculating measures
    verse: [26.5, 118.56], // Array of timestamps in seconds where verses occur
    chorus: [92.25, 158] // Array of timestamps in seconds where choruses occur
  },
  macklemore90: {
    url: 'https://curriculum.code.org/media/uploads/hold.mp3',
    bpm: 146,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [0, 26.3], // Array of timestamps in seconds where verses occur
    chorus: [65.75] // Array of timestamps in seconds where choruses occur
  },
  hammer: {
    url: 'https://curriculum.code.org/media/uploads/touch.mp3',
    bpm: 133,
    delay: 2.32, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  },
  peas: {
    url: 'https://curriculum.code.org/media/uploads/feeling.mp3',
    bpm: 128,
    delay: 0.0, // Seconds to delay before calculating measures
    verse: [1.5, 15.2], // Array of timestamps in seconds where verses occur
    chorus: [5.5, 22.1] // Array of timestamps in seconds where choruses occur
  }
};

export function createDanceAPI(p5Inst) {
  fft = new p5.FFT(0.7, 128);
  peakDetect = new p5.PeakDetect(3000, 5000, 0.1, 3);
  customPeakDetects = [];
  songs = [];

  return {
    fft: {
      analyze: () => {
        const spectrum = fft.analyze();
        peakDetect.update(fft);
        customPeakDetects.forEach(pd => pd.update(fft));
        return spectrum || [];
      },
      getEnergy: (freq1, freq2) => fft.getEnergy(freq1, freq2),
      getCentroid: () => fft.getCentroid(),
      isPeak: n => (customPeakDetects[n] || peakDetect).isDetected,
      createPeakDetect: (...args) => customPeakDetects.push(new p5.PeakDetect(...args)) - 1,
    },

    song: {
      load: () => {console.log('load: ' + song_meta.url); songs.push(p5Inst.loadSound(song_meta.url)) - 1;},
      start: (n = 0) => songs[n].play(),
      stop: (n = 0) => songs[n].stop(),
      stopAll: () => songs.forEach(song => song.stop()),
      isPlaying: (n = 0) => songs[n].isPlaying(),
      currentTime: (n = 0) => songs[n].currentTime(),
      duration: (n = 0) => songs[n].duration(),
      addCue: (n, ...args) => songs[n].addCue(...args),
      clearCues: (n = 0) => songs[n].clearCues(),
      setVolume: (n = 0, vol, rampTime) => songs[n].setVolume(vol, rampTime),
      songData: () => song_meta,
    },
  };
}

export function setSong(song) {
  console.log(song);
  song_meta = songs_data[song];
}