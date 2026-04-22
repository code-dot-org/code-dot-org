import {
  getNodesBounds,
  getViewportForBounds,
  type ReactFlowInstance,
} from '@xyflow/react';
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

const EXPORT_PADDING_PX = 10;
const EXPORT_MIN_ZOOM = 0.5;
const EXPORT_MAX_ZOOM = 2;
const EXPORT_WIDTH_PX = 1024;
const EXPORT_HEIGHT_PX = 768;

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

  const viewportEl = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow__viewport`
  );
  if (!viewportEl) {
    errorCallback(
      `Error saving ${newFileName} to your Backpack. Please try again`
    );
    return;
  }

  const bounds = getNodesBounds(reactFlow.getNodes());
  const viewport = getViewportForBounds(
    bounds,
    EXPORT_WIDTH_PX,
    EXPORT_HEIGHT_PX,
    EXPORT_MIN_ZOOM,
    EXPORT_MAX_ZOOM,
    EXPORT_PADDING_PX
  );

  // Read the themed canvas background so the PNG matches light/dark mode.
  const canvasEl = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow`
  );
  const backgroundColor = canvasEl
    ? getComputedStyle(canvasEl).backgroundColor
    : '#ffffff';

  const blobToSave = await toBlob(viewportEl, {
    backgroundColor,
    width: EXPORT_WIDTH_PX,
    height: EXPORT_HEIGHT_PX,
    style: {
      width: `${EXPORT_WIDTH_PX}px`,
      height: `${EXPORT_HEIGHT_PX}px`,
      transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
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
