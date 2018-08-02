/* global p5 */

export function getDanceAPI(p5Inst) {
  const osc = new p5.Oscillator();
  const fft = new p5.FFT(0.7, 128);
  const peakDetect = new p5.PeakDetect(3000, 5000, 0.1, 3);

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
        return spectrum || [];
      },
      getEnergy: (freq1, freq2) => fft.getEnergy(freq1, freq2),
      isPeak: () => peakDetect.isDetected,
    },

    song: {
      start: () => p5Inst.defaultSong.play(),
      stop: () => p5Inst.defaultSong.stop(),
      isPlaying: () => p5Inst.defaultSong.isPlaying(),
      currentTime: () => p5Inst.defaultSong.currentTime(),
      duration: () => p5Inst.defaultSong.duration(),
    },
  };
}
