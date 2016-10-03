// tests don't have svgelement
if (typeof SVGElement !== 'undefined') {
  // Loading these modules extends SVGElement and puts canvg in the global
  // namespace
  require('canvg');
  require('../third-party/canvg/svg_todataurl');
}
