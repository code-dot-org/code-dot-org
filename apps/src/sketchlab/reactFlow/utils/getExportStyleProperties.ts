// html-to-image copies every computed style property onto every cloned element,
// custom properties included, which is a lot of extra data to copy.
// Their values are already resolved into the standard properties by the time we
// read the computed style, so leaving them out produces an identical picture.
//
// Return the property list html-to-image should copy: everything it would have copied
// on its own, minus the custom properties.
export const getExportStyleProperties = (): string[] =>
  Array.from(window.getComputedStyle(document.documentElement)).filter(
    name => !name.startsWith('--')
  );
