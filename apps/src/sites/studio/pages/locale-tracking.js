import firehoseClient from '@cdo/apps/lib/util/firehose';

const WAIT = 1000;
function debounce(func) {
  var timeout;

  return function executedFunction() {
    var context = this;
    var args = arguments;

    var later = function() {
      timeout = null;
      func.apply(context, args);
    };

    var callNow = !timeout;

    clearTimeout(timeout);

    timeout = setTimeout(later, WAIT);

    if (callNow) func.apply(context, args);
  };
}

const keySet = {};
export function trackTranslation(key, locale) {
  keySet.put(key);
  debounce(function() {
    for (key in keySet) { 
      console.log(key, "called in", locale);
    }
  });

}
