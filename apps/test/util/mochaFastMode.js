/**
 A bit of a hack, we conditionally include this file as an entry point if we
 want fast mode (which results in us ignoring turtle/maze level tests).
 */
window.__ignoreSolutionsRegex = /solutions\/[turtle|maze]/;
