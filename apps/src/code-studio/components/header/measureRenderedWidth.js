// Measure an element's rendered width for the header's desired-width
// reporting. The parent clips to the reported value, and a trailing element
// (e.g. the Remix button and its 1px border) can sit flush against that edge,
// so the measurement must preserve the true sub-pixel extent: jQuery .width()
// rounds to the nearest integer, and a value rounded down lands the clip
// inside the content and shaves that edge.
export default function measureRenderedWidth(el) {
  return el ? el.getBoundingClientRect().width : 0;
}
