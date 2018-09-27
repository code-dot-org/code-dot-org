/* global p5 */

let osc, fft, peakDetect, customPeakDetects, songs, part;

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
      load: song => songs.push(gamelabP5.loadSound(song)) - 1,
      start: (n = 0) => songs[n].play(),
      stop: (n = 0) => songs[n].stop(),
      isPlaying: (n = 0) => songs[n].isPlaying(),
      currentTime: (n = 0) => songs[n].currentTime(),
      duration: (n = 0) => songs[n].duration(),
      processPeaks: (n = 0, ...args) => songs[n].processPeaks(...args),
      addCue: (n, ...args) => songs[n].addCue(...args),
      clearCues: (n = 0) => songs[n].clearCues(),
      setVolume: (n = 0, vol, rampTime) => songs[n].setVolume(vol, rampTime),
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
