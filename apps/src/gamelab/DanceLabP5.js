/* global p5 */

export function getDanceAPI(p5Inst) {
  const osc = new p5.Oscillator();

  return {
    oscillator: {
      start: () => osc.start(),
      stop: () => osc.stop(),
      freq: value => osc.freq(value),
      amp: value => osc.amp(value),
    }
  };
}
