// Measure an element's rendered width for the header's desired-width reporting.
// getBoundingClientRect reports the true sub-pixel extent; jQuery .width()
// rounds it to the nearest integer, so a width whose fraction is below one
// half lands the parent's overflow:hidden clip up to half a pixel inside the
// content and shaves the trailing element (e.g. the Remix button's border).
export default function measureRenderedWidth(el) {
  return el ? el.getBoundingClientRect().width : 0;
}
