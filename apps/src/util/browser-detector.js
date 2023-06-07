// We support IE 11+
function isIE() {
  return navigator.userAgent.indexOf('MSIE') !== -1 || isIE11();
}

function IEVersion() {
  return isIE11()
    ? '11'
    : navigator.userAgent
        .substring(navigator.userAgent.lastIndexOf('MSIE') + 5)
        .split('.')[0];
}

function isUnsupportedIE() {
  return isIE() && IEVersion() < 11;
}

// We support Chrome 33.x +
function isChrome() {
  return navigator.userAgent.lastIndexOf('Chrome/') !== -1;
}

function chromeVersion() {
  return navigator.userAgent
    .substring(navigator.userAgent.lastIndexOf('Chrome/') + 7)
    .split('.')[0];
}

function isUnsupportedChrome() {
  return isChrome() && chromeVersion() < 33;
}

// We support Safari 7.0.x +
function isSafari() {
  return navigator.userAgent.indexOf('Safari/') !== -1;
}

function safariVersion() {
  return navigator.userAgent
    .substring(navigator.userAgent.lastIndexOf('Version/') + 8)
    .split('.')[0];
}

function isUnsupportedSafari() {
  return isSafari() && safariVersion() < 7;
}

// We support Firefox 25.x +
function isFirefox() {
  return navigator.userAgent.indexOf('Firefox') !== -1;
}

function firefoxVersion() {
  return navigator.userAgent
    .substring(navigator.userAgent.lastIndexOf('Firefox/') + 8)
    .split('.')[0];
}

function isUnsupportedFirefox() {
  return isFirefox() && firefoxVersion() < 25;
}

// https://support.code.org/hc/en-us/articles/202591743
// for the full list of supported browsers
export function isUnsupportedBrowser() {
  return (
    isUnsupportedIE() ||
    isUnsupportedChrome() ||
    isUnsupportedSafari() ||
    isUnsupportedFirefox()
  );
}

// Detect a mobile device.
export function isMobileDevice() {
  // Adapted from http://detectmobilebrowsers.com/ with the addition of |android|ipad|playbook|silk as
  // it suggests at http://detectmobilebrowsers.com/about
  // Note that there are two regular expressions in the blob.  The first tests against variable a (the entire
  // user agent) while the second tests against just the first four characters in it.

  var check = false;
  (function (a) {
    if (
      /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino|android|ipad|playbook|silk/i.test(
        a
      ) ||
      /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
        a.substr(0, 4)
      )
    ) {
      check = true;
    }
  })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
}

// Detect IE11.  Adapted from
// http://stackoverflow.com/questions/21825157/internet-explorer-11-detection/21825207#21825207
export function isIE11() {
  var isIE11 = !!window.MSInputMethodContext && !!document.documentMode;
  return isIE11;
}

// Determine whether local storage is available.  On macOS Safari Private Mode it won't be.
// Adapted from https://gist.github.com/paulirish/5558557#gistcomment-1755099
export function isStorageAvailable(type) {
  try {
    var storage = window[type],
      x = '__storage_test__';
    storage.setItem(x, x);
    storage.removeItem(x);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * Get the current browser and, if specified, the current browser version.
 * Returns the user agent string if the browser is unknown.
 */
export function getBrowserName(includeVersion = false) {
  if (isChrome()) {
    return 'Chrome' + (includeVersion ? ` ${chromeVersion()}` : '');
  }

  if (isIE()) {
    return 'Internet Explorer' + (includeVersion ? ` ${IEVersion()}` : '');
  }

  if (isFirefox()) {
    return 'Firefox' + (includeVersion ? ` ${firefoxVersion()}` : '');
  }

  if (isSafari()) {
    return 'Safari' + (includeVersion ? ` ${safariVersion()}` : '');
  }

  return navigator.userAgent;
}
