import {toBlob} from 'html-to-image';

import {capExportPixelRatio} from '@cdo/apps/util/imageExport/capExportPixelRatio';
import {getExportStyleProperties} from '@cdo/apps/util/imageExport/getExportStyleProperties';
import {getFontEmbedCss} from '@cdo/apps/util/imageExport/getFontEmbedCss';
import {inlineSvgStylesForExport} from '@cdo/apps/util/imageExport/inlineSvgStylesForExport';

const PADDING_PX = 24;
const MAX_PIXEL_RATIO = 2;
const FALLBACK_NAME = 'decision-tree';

export const treeImageName = (datasetName = ''): string => {
  const slug = datasetName
    .replace(/\.csv$/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug ? `${slug}-tree` : FALLBACK_NAME;
};

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
      pixelRatio: capExportPixelRatio(MAX_PIXEL_RATIO, width, height),
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
