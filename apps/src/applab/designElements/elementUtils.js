// Taken from http://stackoverflow.com/a/3627747/2506748
module.exports.rgb2hex = function (rgb) {
  if (rgb === '') {
    return rgb;
  }
  var parsed = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
  if (parsed === null) {
    return rgb;
  }
  function hex(x) {
    return ("0" + parseInt(x).toString(16)).slice(-2);
  }
  return "#" + hex(parsed[1]) + hex(parsed[2]) + hex(parsed[3]);
};
