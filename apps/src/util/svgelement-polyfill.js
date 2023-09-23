// tests don't have svgelement
if (typeof SVGElement !== 'undefined') {
  // Loading these modules extends SVGElement and puts canvg in the global
  // namespace
  require('canvg'); // eslint-disable-line import/no-commonjs
  require('../third-party/canvg/svg_todataurl'); // eslint-disable-line import/no-commonjs
}
