import {type ReactFlowInstance} from '@xyflow/react';
import {toBlob} from 'html-to-image';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {SKETCHLAB_CONTAINER_CLASS} from '../components/ReactFlowCanvas';

import {computeExportDimensions} from './computeExportDimensions';
import {getCanvasBounds} from './getCanvasBounds';

const EXPORT_PADDING_PX = 10;
// Cap the longer side of the exported PNG. Small sketches export at 1:1.
// Only sketches larger than this along either axis are scaled down to fit.
const MAX_EXPORT_DIMENSION_PX = 2048;

export const handleSaveToBackpack = async (
  reactFlow: ReactFlowInstance | null,
  backpackApi: BackpackClientApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void
) => {
  if (!reactFlow || !backpackApi) {
    return;
  }

  const validateSketchName = (
    sketchName: string
  ): {type: 'error' | 'warning'; text: string} | undefined => {
    if (sketchName.length === 0) {
      return undefined;
    }
    const containsValidCharacters = /^[\w-]+$/.test(sketchName);
    if (!containsValidCharacters) {
      return {
        type: 'error',
        text: 'Sketch names can only contain letters, numbers, hyphens and underscores.',
      };
    }
    if (backpackFileList.includes(sketchName + '.png')) {
      return {
        type: 'warning',
        text: 'A file with this name already exists in your Backpack.',
      };
    }
  };

  const dialogResults = await dialogControl.showDialog({
    type: DialogType.GenericPrompt,
    title: 'Give your sketch a name',
    validateInput: validateSketchName,
    message: 'Save sketch as:',
    useModal: true,
    confirmButtonText: 'Save to Backpack',
    confirmButtonTextWithWarning: 'Replace existing file',
  });
  if (dialogResults.type !== 'confirm') {
    return;
  }

  const newFileName = extractUserInput(dialogResults) + '.png';

  const viewport = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow__viewport`
  );
  if (!viewport) {
    errorCallback(
      `Error saving ${newFileName} to your Backpack. Please try again`
    );
    return;
  }

  // Read the themed canvas background so the PNG matches light/dark mode.
  const canvas = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow`
  );

  // Find the bounding box of all nodes and edges on the canvas.
  const rootRect = (canvas ?? viewport).getBoundingClientRect();
  const contentElements = document.querySelectorAll<Element>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow__node,` +
      `.${SKETCHLAB_CONTAINER_CLASS} .react-flow__edge`
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
    errorCallback(
      'Add something to your workspace before saving to your backpack'
    );
    return;
  }
  const {imageWidth, imageHeight, scale, translateX, translateY} =
    computeExportDimensions(bounds, EXPORT_PADDING_PX, MAX_EXPORT_DIMENSION_PX);
  const backgroundColor = canvas
    ? getComputedStyle(canvas).backgroundColor
    : '#ffffff';

  const blobToSave = await toBlob(viewport, {
    backgroundColor,
    width: imageWidth,
    height: imageHeight,
    style: {
      width: `${imageWidth}px`,
      height: `${imageHeight}px`,
      transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
    },
  });
  if (!blobToSave) {
    errorCallback(
      `Error saving ${newFileName} to your Backpack. Please try again`
    );
    return;
  }

  const eventName = backpackFileList.includes(newFileName)
    ? EVENTS.SAVE_TO_BACKPACK_REPLACE
    : EVENTS.SAVE_TO_BACKPACK_NEW;
  backpackApi.saveBlobFile(
    newFileName,
    blobToSave,
    () => {
      errorCallback(
        `Error saving ${newFileName} to your Backpack. Please try again`
      );
    },
    () => {
      sendLab2AnalyticsEvent(eventName, {fileType: 'png'});
    }
  );
};
