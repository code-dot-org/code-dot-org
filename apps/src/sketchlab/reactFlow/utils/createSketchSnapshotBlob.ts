import {type ReactFlowInstance} from '@xyflow/react';
import {toBlob} from 'html-to-image';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

import {SKETCHLAB_CONTAINER_CLASS} from '../components/ReactFlowCanvas';
import {REACT_FLOW_SELECTOR} from '../reactFlowSelectors';

import {computeExportDimensions} from './computeExportDimensions';
import {getCanvasBounds} from './getCanvasBounds';
import {getExportStyleProperties} from './getExportStyleProperties';
import {getSketchFontEmbedCss} from './getSketchFontEmbedCss';
import {inlineSvgStylesForExport} from './inlineSvgStylesForExport';
import {SketchCaptureError} from './SketchCaptureError';

const EXPORT_PADDING_PX = 10;
// Cap the longer side of the exported PNG. Small sketches export at 1:1.
// Only sketches larger than this along either axis are scaled down to fit.
const MAX_EXPORT_DIMENSION_PX = 2048;
export const CAPTURE_ERROR = 'Could not capture your sketch. Please try again.';

export const createSketchSnapshotBlob = async (
  reactFlow: ReactFlowInstance | null
): Promise<{blob?: Blob; error?: string}> => {
  if (!reactFlow) {
    return {error: 'Sketch is not ready yet. Please try again.'};
  }

  const viewport = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} ${REACT_FLOW_SELECTOR.viewport}`
  );
  if (!viewport) {
    return {error: CAPTURE_ERROR};
  }

  // Read the themed canvas background so the PNG matches light/dark mode.
  const canvas = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} ${REACT_FLOW_SELECTOR.container}`
  );

  // Find the bounding box of all nodes and edges on the canvas.
  const rootRect = (canvas ?? viewport).getBoundingClientRect();
  const contentElements = document.querySelectorAll<Element>(
    `.${SKETCHLAB_CONTAINER_CLASS} ${REACT_FLOW_SELECTOR.node},` +
      `.${SKETCHLAB_CONTAINER_CLASS} ${REACT_FLOW_SELECTOR.edge}`
  );
  const contentRects = Array.from(contentElements, element =>
    element.getBoundingClientRect()
  );
  const bounds = getCanvasBounds(
    contentRects,
    rootRect,
    reactFlow.getViewport()
  );
  if (!bounds) {
    return {error: 'Add something to your workspace before downloading.'};
  }

  const {imageWidth, imageHeight, scale, translateX, translateY} =
    computeExportDimensions(bounds, EXPORT_PADDING_PX, MAX_EXPORT_DIMENSION_PX);
  const backgroundColor = canvas
    ? getComputedStyle(canvas).backgroundColor
    : '#ffffff';

  const restoreSvgStyles = inlineSvgStylesForExport(viewport);
  let blob: Blob | null;
  try {
    // Supplying this stops html-to-image from inlining every font the page declares.
    const fontEmbedCSS = await getSketchFontEmbedCss(viewport);
    blob = await toBlob(viewport, {
      backgroundColor,
      fontEmbedCSS,
      includeStyleProperties: getExportStyleProperties(),
      width: imageWidth,
      height: imageHeight,
      style: {
        width: `${imageWidth}px`,
        height: `${imageHeight}px`,
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
      },
    });
  } catch (cause) {
    const captureError = new SketchCaptureError(cause, {
      elements: contentRects.length,
      images: viewport.querySelectorAll('img').length,
      imageWidth,
      imageHeight,
    });
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Sketch snapshot error', captureError, captureError.details);
    return {error: CAPTURE_ERROR};
  } finally {
    restoreSvgStyles();
  }

  if (!blob) {
    return {error: CAPTURE_ERROR};
  }

  return {blob};
};
