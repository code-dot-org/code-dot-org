/* global p5 */

let osc, fft, peakDetect, customPeakDetects, songs, part, song_meta;

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

export function createDanceAPI(gamelabP5) {
  osc = new p5.Oscillator();
  fft = new p5.FFT(0.7, 128);
  peakDetect = new p5.PeakDetect(3000, 5000, 0.1, 3);
  customPeakDetects = [];
  songs = [];

  const noise = new p5.Noise();
  noise.amp(0);
  noise.start();
  const env = new p5.Env();
  env.setADSR(0.001, 0.01, 0.1, 0.1);
  env.setRange(1, 0);
  let callback = () => {};

  const playTick = (time, vol) => {
    callback();
    if (vol < 0.1) {
      return;
    }
    env.setRange(vol, 0);
    env.play(noise);
  };
  const phrase = new p5.Phrase('tick', playTick, [
    1.0, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001,
    0.2, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001, 0.0001,
  ]);
  part = new p5.Part(48, 1 / 48);
  part.addPhrase(phrase);
  part.setBPM(100 * 1.2);

  return {
    oscillator: {
      start: () => osc.start(),
      stop: () => osc.stop(),
      freq: (freq, rampTime, timeFromNow) => osc.freq(freq, rampTime, timeFromNow),
      amp: (vol, rampTime, timeFromNow) => osc.amp(vol, rampTime, timeFromNow),
    },

    fft: {
      analyze: () => {
        const spectrum = fft.analyze();
        peakDetect.update(fft);
        customPeakDetects.forEach(pd => pd.update(fft));
        return spectrum || [];
      },
      getEnergy: (freq1, freq2) => fft.getEnergy(freq1, freq2),
      getCentroid: () => fft.getCentroid(),
      waveform: bins => fft.waveform(bins),
      isPeak: n => (customPeakDetects[n] || peakDetect).isDetected,
      createPeakDetect: (...args) => customPeakDetects.push(new p5.PeakDetect(...args)) - 1,
      onPeak: (n, callback) => (customPeakDetects[n] || peakDetect).onPeak(callback),
    },

    song: {
      load: () => songs.push(gamelabP5.loadSound(song_meta.url)) - 1,
      start: (n = 0) => songs[n].play(),
      stop: (n = 0) => songs[n].stop(),
      isPlaying: (n = 0) => songs[n].isPlaying(),
      currentTime: (n = 0) => songs[n].currentTime(),
      duration: (n = 0) => songs[n].duration(),
      processPeaks: (n = 0, ...args) => songs[n].processPeaks(...args),
      addCue: (n, ...args) => songs[n].addCue(...args),
      clearCues: (n = 0) => songs[n].clearCues(),
      setVolume: (n = 0, vol, rampTime) => songs[n].setVolume(vol, rampTime),
      delay: () => song_meta.delay,
      bpm: () => song_meta.bpm,
    },

    metronome: {
      start: () => part.loop(),
      setBPM: n => part.setBPM(n * 1.2),
      stop: () => part.stop(),
      registerTick: f => callback = f,
    },
  };
}

export function teardown() {
  if (!osc) {
    return;
  }

  songs.forEach(song => {
    song.clearCues();
    song.stop();
  });
  songs.length = 0;
  customPeakDetects.length = 0;
  peakDetect = null;
  fft = null;
  osc.stop();
  osc = null;
  part.stop();
  part.metro.clock.dispose();
  part = null;
}

export function setSong(song) {
  song_meta = songs_data[song];
}
