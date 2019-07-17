import firehoseClient from '@cdo/apps/lib/util/firehose';

const WAIT = 1000;
var timeout;
function debounce(func) {

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
}

const keySet = new Set;
export function trackTranslation(key, locale) {
  keySet.add(key);
  debounce(function() {
    console.log("debounced!");
    keySet.forEach(key => { console.log(key); });
    keySet.clear();
  });

}
