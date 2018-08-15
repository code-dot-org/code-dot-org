import $ from 'jquery';

export default function loadSource(src) {
  var deferred = new $.Deferred();
  var scr = $(`script[src="${src}"]`);
  if (scr.length <= 0) {
    document.head.appendChild($('<script>', { src: src }).on('load', function () {
      deferred.resolve();
    })[0]);
  } else {
    deferred.resolve();
  }
  return deferred;
}
