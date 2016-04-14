/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled one of two ways
 * (1) enable: localStorage.set('experiments-experimentName', true)
 *     disable: localStorage.removeItem('experiments-experimentName')
 * (2) Add a query param, i.e. http://foo.com?experimentName=true or
 *     http://foo.com?experimentName=false
 * The latter approach ends up toggling the localStorage state.
 */
var experiments = module.exports;

/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  var enabled;
  var queryString = this.__TestInterface__.queryString ||
    window.location.search;

  // check query string, and update localStorage if necessary
  var regex = new RegExp(key + '=(true|false)');
  var match = regex.exec(queryString);
  if (match) {
    enabled = match[1] === 'true';
    if (enabled) {
      localStorage.setItem('experiments-' + key, 'true');
    } else {
      localStorage.removeItem('experiments-' + key);
    }
  } else {
    // key no in query string, go look at local storage
    enabled = (localStorage.getItem('experiments-' + key) === 'true');
  }

  return enabled;
};

// can be set to fake window.location.search
experiments.__TestInterface__ = {
  queryString: undefined
};
