/**
 * This module contains logic for tracking various experiments. Experiments
 * can be enabled/disabled one of two ways
 * (1) enable: localStorage.set('experimentName', true)
 *     disable: localStorage.removeItem('experimentName')
 * (2) Add a query param, i.e. http://foo.com?experimentName=true or
 *     http://foo.com?experimentName=false
 * The latter approach ends up toggling the localStorage state.
 */
var experiments = module.exports;

// List of experiements, and their current enabled/disabled state
var experimentList = {
  topInstructions: false,
  runModeIndicators: false
};

var performedLoad = false;

/**
 * Checks whether provided experiment is enabled or not
 * @param {string} key - Name of experiment in question
 * @returns {bool}
 */
experiments.isEnabled = function (key) {
  if (!performedLoad) {
    loadFromLocalStorage();
    processQueryParams(window.location.search);
    performedLoad = true;
  }
  return experimentList[key] === true;
};

/**
 * Looks at query params and sees if we need to toggle the state of any of our
 * experiments
 */
function processQueryParams(queryString) {
  Object.keys(experimentList).forEach(function (key) {
    var regex = new RegExp(key + '=(true|false)');
    var match = regex.exec(queryString);
    if (match) {
      var val = match[1] === 'true';
      if (val) {
        localStorage.setItem(key, val);
      } else {
        localStorage.removeItem(key);
      }
      experimentList[key] = val;
    }
  });
}

/**
 * Checks local storage to see what experiments we have enabled
 */
function loadFromLocalStorage() {
  Object.keys(experimentList).forEach(function (key) {
    if (localStorage.getItem(key) === "true") {
      experimentList[key] = true;
    }
  });
}

experiments.__TestInterface__ = {
  processQueryParams: processQueryParams,
  loadFromLocalStorage: loadFromLocalStorage,
  // reset all of our keys to false
  reset: function () {
    Object.keys(experimentList).forEach(function (key) {
      experimentList[key] = false;
    });
  }
};
