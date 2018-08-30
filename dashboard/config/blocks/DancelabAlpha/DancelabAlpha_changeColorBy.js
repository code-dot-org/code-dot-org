function changeColorBy(input, method, amount) {
  push();
  colorMode(HSB, 100);
  var c = color(input);
  var hsb = {
    hue: c._getHue(),
    saturation: c._getSaturation(),
    brightness: c._getBrightness()
  };
  hsb[method] = Math.round((hsb[method] + amount) % 100);
  var new_c = color(hsb.hue, hsb.saturation, hsb.brightness);
  pop();
  return new_c;
}