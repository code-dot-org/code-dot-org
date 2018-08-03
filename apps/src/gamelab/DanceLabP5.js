/* global p5 */

export function getDanceAPI(p5Inst) {
  const osc = new p5.Oscillator();
  const fft = new p5.FFT(0.7, 128);
  const peakDetect = new p5.PeakDetect(3000, 5000, 0.1, 3);
  const customPeakDetects = [];
  const songs = [];

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
      load: song => songs.push(p5Inst.loadSound(song)) - 1,
      start: (n = 0) => songs[n].play(),
      stop: (n = 0) => songs[n].stop(),
      isPlaying: (n = 0) => songs[n].isPlaying(),
      currentTime: (n = 0) => songs[n].currentTime(),
      duration: (n = 0) => songs[n].duration(),
      processPeaks: (n = 0, ...args) => songs[n].processPeaks(...args),
      addCue: (n, ...args) => songs[n].addCue(...args),
      clearCues: (n = 0) => songs[n].clearCues(),
    },
  };
}
