import unwrappedHtml2Canvas from 'html2canvas';

// Add an extra wrapper around html2canvas so that it can be stubbed by tests.
const html2canvas = (element, options) =>
  unwrappedHtml2Canvas(element, options);

export {html2canvas};

// Needed by html2canvas in SVGContainer.hasFabric to work on IE 11.
window.html2canvas = html2canvas;
