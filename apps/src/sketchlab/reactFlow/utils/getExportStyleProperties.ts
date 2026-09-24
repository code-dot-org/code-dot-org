// html-to-image copies every computed style property onto every cloned element,
// and that includes the design system's CSS custom properties -- hundreds of
// them, tens of kilobytes per element. A big sketch then exceeds the 64 MiB cap
// Safari puts on the data url it renders the capture through, and the export
// fails there while Chrome, which has no such cap, succeeds.
//
// Their values are already resolved into the standard properties by the time we
// read the computed style, so leaving them out produces an identical picture.

let exportStyleProperties: string[] | undefined;

// The property list html-to-image should copy: everything it would have copied
// on its own, minus the custom properties.
export const getExportStyleProperties = (): string[] => {
  if (!exportStyleProperties) {
    exportStyleProperties = Array.from(
      window.getComputedStyle(document.documentElement)
    ).filter(name => !name.startsWith('--'));
  }
  return exportStyleProperties;
};
