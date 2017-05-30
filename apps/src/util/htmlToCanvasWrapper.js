// Export html2canvas as a non-default so that it can be stubbed by tests.
import html2canvas from 'html2canvas';
export {html2canvas as html2canvas};

// Needed by html2canvas in SVGContainer.hasFabric to work on IE 11.
window.html2canvas = html2canvas;
