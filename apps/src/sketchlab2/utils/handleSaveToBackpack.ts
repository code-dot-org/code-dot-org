import {type ReactFlowInstance} from '@xyflow/react';

import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

function reactFlowToBlob(viewportElement: HTMLElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const {width, height} = viewportElement.getBoundingClientRect();
    const svgElements = viewportElement.querySelectorAll('svg');
    const canvas = document.createElement('canvas');
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Could not create canvas context'));
      return;
    }
    ctx.scale(2, 2);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Serialize the viewport to an SVG image via foreignObject
    const svgData = new XMLSerializer().serializeToString(
      svgElements[0] || viewportElement
    );
    const svgBlob = new Blob([svgData], {type: 'image/svg+xml;charset=utf-8'});
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0, width, height);
      URL.revokeObjectURL(url);
      canvas.toBlob(blob => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create image blob'));
        }
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to render canvas image'));
    };
    img.src = url;
  });
}

export const handleSaveToBackpack = async (
  reactFlowInstance: ReactFlowInstance | undefined | null,
  backpackApi: BackpackClientApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void
) => {
  if (!reactFlowInstance || !backpackApi) {
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

  const viewportElement = document.querySelector(
    '.react-flow__viewport'
  ) as HTMLElement;
  if (!viewportElement) {
    errorCallback('Could not find the sketch canvas to export.');
    return;
  }

  try {
    const blobToSave = await reactFlowToBlob(viewportElement);

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
  } catch {
    errorCallback('Error exporting sketch as image. Please try again.');
  }
};
