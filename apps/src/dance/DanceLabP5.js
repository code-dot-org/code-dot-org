/* global p5 */

let fft, peakDetect, customPeakDetects, songs;

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
      load: song => songs.push(p5Inst.loadSound(song)) - 1,
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
  };
}

export function teardown() {
  if (!fft) {
    return;
  }

  songs.forEach(song => song.stop());
  songs.length = 0;
  customPeakDetects.length = 0;
  peakDetect = null;
  fft = null;
}
