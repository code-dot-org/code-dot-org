// Measure an element's rendered width for the header's desired-width
// reporting. The value sizes an overflow:hidden clip whose trailing element
// (e.g. the Remix button and its 1px border) sits flush against the clip
// edge, so the measurement must preserve the true sub-pixel extent: anything
// rounded down lands the clip inside the content and shaves that edge.
export default function measureRenderedWidth(el) {
  return el ? el.getBoundingClientRect().width : 0;
}
