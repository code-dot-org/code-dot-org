function hsbColor(h, s, b) {
  colorMode(HSB);
  var c = color(h, s, b);
  colorMode(RGB);
  return c;
}