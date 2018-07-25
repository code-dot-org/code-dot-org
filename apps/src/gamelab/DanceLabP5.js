const osc = new window.p5.Oscillator();

export const oscillator = {
  start: () => osc.start(),
  stop: () => osc.stop(),
  freq: value => osc.freq(value),
  amp: value => osc.amp(value),
};
