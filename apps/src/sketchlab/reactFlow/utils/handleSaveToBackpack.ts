import {getNodesBounds, type ReactFlowInstance} from '@xyflow/react';
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
// Cap the longer side of the exported PNG. Small sketches export at 1:1
// (so a single node looks crisp, not tiny); only sketches larger than this
// along either axis are scaled down to fit.
const MAX_EXPORT_DIM_PX = 2048;

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

  const nodes = reactFlow.getNodes();
  if (nodes.length === 0) {
    errorCallback(
      `Error saving ${newFileName} to your Backpack. Please try again`
    );
    return;
  }
  const bounds = getNodesBounds(nodes);
  const contentWidth = bounds.width + 2 * EXPORT_PADDING_PX;
  const contentHeight = bounds.height + 2 * EXPORT_PADDING_PX;
  // Scale down only if content exceeds MAX_EXPORT_DIM_PX along either axis;
  // otherwise export at 1:1 so small sketches don't get shrunk.
  const scale = Math.min(
    1,
    MAX_EXPORT_DIM_PX / Math.max(contentWidth, contentHeight)
  );
  const imageWidth = Math.round(contentWidth * scale);
  const imageHeight = Math.round(contentHeight * scale);
  const translateX = (-bounds.x + EXPORT_PADDING_PX) * scale;
  const translateY = (-bounds.y + EXPORT_PADDING_PX) * scale;

  // Read the themed canvas background so the PNG matches light/dark mode.
  const canvasEl = document.querySelector<HTMLElement>(
    `.${SKETCHLAB_CONTAINER_CLASS} .react-flow`
  );
  const backgroundColor = canvasEl
    ? getComputedStyle(canvasEl).backgroundColor
    : '#ffffff';

  const blobToSave = await toBlob(viewportEl, {
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
