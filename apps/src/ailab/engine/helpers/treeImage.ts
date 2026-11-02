import {toBlob} from 'html-to-image';

import {getExportStyleProperties} from '@cdo/apps/util/imageExport/getExportStyleProperties';
import {getFontEmbedCss} from '@cdo/apps/util/imageExport/getFontEmbedCss';
import {inlineSvgStylesForExport} from '@cdo/apps/util/imageExport/inlineSvgStylesForExport';

const PADDING_PX = 24;
// Twice the layout size keeps labels sharp when a student zooms in on a slide.
const MAX_PIXEL_RATIO = 2;
// iOS Safari refuses to draw a canvas with more pixels than this.
const MAX_CANVAS_PIXELS = 4096 * 4096;
const FALLBACK_NAME = 'decision-tree';

// A Backpack file name may hold only letters, digits, hyphens and underscores.
export const treeImageName = (datasetName = ''): string => {
  const slug = datasetName
    .replace(/\.csv$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}-tree` : FALLBACK_NAME;
};

export const treePixelRatio = (width: number, height: number): number =>
  Math.min(MAX_PIXEL_RATIO, Math.sqrt(MAX_CANVAS_PIXELS / (width * height)));

// Draws the whole tree at its layout size, whatever the canvas is zoomed to.
export const captureTreeImage = async (tree: HTMLElement): Promise<Blob> => {
  const width = tree.offsetWidth + 2 * PADDING_PX;
  const height = tree.offsetHeight + 2 * PADDING_PX;
  const fontEmbedCSS = await getFontEmbedCss(tree);
  const restoreSvgStyles = inlineSvgStylesForExport(tree);
  try {
    const blob = await toBlob(tree, {
      backgroundColor: window
        .getComputedStyle(tree)
        .getPropertyValue('--background-neutral-primary'),
      fontEmbedCSS,
      includeStyleProperties: getExportStyleProperties(),
      pixelRatio: treePixelRatio(width, height),
      width,
      height,
      style: {transform: `translate(${PADDING_PX}px, ${PADDING_PX}px)`},
    });
    if (!blob) {
      throw new Error('html-to-image produced no image');
    }
    return blob;
  } finally {
    restoreSvgStyles();
  }
};

export const downloadImage = (image: Blob, fileName: string) => {
  const url = URL.createObjectURL(image);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
};
