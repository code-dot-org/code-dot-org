// NOTE: min and max are inclusive
export const utils = {
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};
