// The capture is serialized to XML, so a character XML forbids -- a control
// character or a lone surrogate, which reach a sketch by paste -- makes the SVG
// unparseable and the export fails outright, in every browser. We drop those
// characters for the duration of the capture and put the text back after.

// XML 1.0 allows tab, newline, carriage return, and the rest of the code points
// below; the `u` flag keeps astral characters such as emoji intact. Built from a
// string because the build targets es5, which bars that flag on a literal.
const INVALID_XML_CHARACTERS = new RegExp(
  // eslint-disable-next-line no-control-regex
  '[^\\u{9}\\u{A}\\u{D}\\u{20}-\\u{D7FF}\\u{E000}-\\u{FFFD}\\u{10000}-\\u{10FFFF}]',
  'gu'
);

// Returns a function restoring the text this changed.
export const sanitizeTextForExport = (root: HTMLElement): (() => void) => {
  const originalText = new Map<Text, string>();
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode();
  while (node) {
    const text = node.nodeValue ?? '';
    const sanitized = text.replace(INVALID_XML_CHARACTERS, '');
    if (sanitized !== text) {
      originalText.set(node as Text, text);
      node.nodeValue = sanitized;
    }
    node = walker.nextNode();
  }
  return () =>
    originalText.forEach((text, textNode) => {
      textNode.nodeValue = text;
    });
};
