import {toBlob} from 'html-to-image';

import {getExportStyleProperties} from '@cdo/apps/util/imageExport/getExportStyleProperties';
import {getFontEmbedCss} from '@cdo/apps/util/imageExport/getFontEmbedCss';
import {inlineSvgStylesForExport} from '@cdo/apps/util/imageExport/inlineSvgStylesForExport';

const PADDING_PX = 24;
const MAX_PIXEL_RATIO = 2;
const IOS_SAFARI_MAX_CANVAS_PIXELS = 4096 * 4096;
const FALLBACK_NAME = 'decision-tree';

export const treeImageName = (datasetName = ''): string => {
  const slug = datasetName
    .replace(/\.csv$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}-tree` : FALLBACK_NAME;
};

export const treePixelRatio = (width: number, height: number): number =>
  Math.min(
    MAX_PIXEL_RATIO,
    Math.sqrt(IOS_SAFARI_MAX_CANVAS_PIXELS / (width * height))
  );

const drawTree = async (tree: HTMLElement): Promise<Blob> => {
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

let lastCapture: Promise<unknown> = Promise.resolve();

// Overlapping captures would each restore the other's temporary styles as originals.
export const captureTreeImage = (tree: HTMLElement): Promise<Blob> => {
  const capture = lastCapture.then(() => drawTree(tree));
  lastCapture = capture.catch(() => {});
  return capture;
};
