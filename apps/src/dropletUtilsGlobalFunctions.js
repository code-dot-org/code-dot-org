export const globalFunctions = {
  randomNumber(min, max) {
    if (typeof max === 'undefined') {
      // If only one parameter is specified, use it as the max with zero as min:
      max = min;
      min = 0;
    }
    // Use double-tilde to ensure we are dealing with integers:
    return Math.floor(Math.random() * (~~max - ~~min + 1)) + ~~min;
  },

  getTime() {
    return (new Date()).getTime();
  },

  /**
   * Use native window.prompt to ask for a value, but continue prompting until we
   * get a numerical value.
   * @returns {number} User value, converted to a number
   */
  promptNum(text) {
    let val;
    do {
      val = Number(window.prompt(text));
    } while (isNaN(val));
    return val;
  },
};
