import {type ReactFlowInstance} from '@xyflow/react';

import {waitForShareFailureRefresh} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ShareFailure, ShareFailureType} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  isUnifiedApi,
  SaveToBackpackApi,
} from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Backpack/saveToBackpackHelper';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {getStore} from '@cdo/apps/redux';
import {FilenamesByAppType} from '@cdo/apps/sharedComponents/backpack/types';

import {createSketchSnapshotBlob} from './createSketchSnapshotBlob';

export const SAVE_BLOCKED_TITLE = "This sketch can't be saved to your Backpack";

const CONTACT_SUPPORT =
  'If you think this is a mistake, contact support@code.org.';

export const ABUSE_BLOCKED_MESSAGE =
  'This sketch was flagged for content that violates our Terms of Service, ' +
  'so it cannot be saved to your Backpack. If an image you added was ' +
  'flagged, remove it from your sketch and try again. ' +
  CONTACT_SUPPORT;

const SHARE_FAILURE_REASONS: Record<ShareFailureType, string> = {
  profanity: 'it may contain profanity',
  email: 'it appears to contain an email address',
  phone: 'it appears to contain a phone number',
  address: 'it appears to contain a street address',
};

const SHARE_FAILURE_FALLBACK_REASON = 'it contains flagged content';

export const getShareFailureMessage = (shareFailure: ShareFailure) => {
  const reason =
    SHARE_FAILURE_REASONS[shareFailure.type] ?? SHARE_FAILURE_FALLBACK_REASON;
  const flaggedText = shareFailure.content
    ? `Flagged text: "${shareFailure.content}". `
    : '';
  return (
    `This sketch can't be saved to your Backpack because ${reason}. ` +
    flaggedText +
    'Remove the flagged text from your sketch and try again. ' +
    CONTACT_SUPPORT
  );
};

export const handleSaveToBackpack = async (
  reactFlow: ReactFlowInstance | null,
  backpackApi: SaveToBackpackApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void
) => {
  if (!reactFlow || !backpackApi) {
    return;
  }

  // Flush save so we can read the latest moderation state.
  try {
    await Lab2Registry.getInstance().getProjectManager()?.flushSave();
    await waitForShareFailureRefresh();
  } catch (error) {
    errorCallback('Could not save your sketch. Please try again.');
    return;
  }

  const {isBlockedAbuse, shareFailure} = getStore().getState().lab;
  const blockedMessage = isBlockedAbuse
    ? ABUSE_BLOCKED_MESSAGE
    : shareFailure
    ? getShareFailureMessage(shareFailure)
    : undefined;
  if (blockedMessage) {
    await dialogControl.showDialog({
      type: DialogType.GenericAlert,
      title: SAVE_BLOCKED_TITLE,
      message: blockedMessage,
    });
    return;
  }

  const unifiedApi = isUnifiedApi(backpackApi) ? backpackApi : undefined;

  // The unified backpack writes to the universal backpack, so a name taken in any
  // backpack collides. The legacy path reuses the list the panel already loaded.
  let filenamesByAppType: FilenamesByAppType;
  try {
    filenamesByAppType = isUnifiedApi(backpackApi)
      ? await backpackApi.getFileLists()
      : {[backpackApi.appType]: backpackFileList};
  } catch (error) {
    errorCallback('Could not read your Backpack. Please try again.');
    return;
  }
  const existingFilenames = Object.values(filenamesByAppType).flat();

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
    if (existingFilenames.includes(sketchName + '.png')) {
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
  const {blob, error} = await createSketchSnapshotBlob(reactFlow);
  if (error) {
    errorCallback(error);
    return;
  }
  if (!blob) {
    errorCallback(
      `Error saving ${newFileName} to your Backpack. Please try again`
    );
    return;
  }

  const isDuplicateFileName = existingFilenames.includes(newFileName);
  const eventName = isDuplicateFileName
    ? EVENTS.SAVE_TO_BACKPACK_REPLACE
    : EVENTS.SAVE_TO_BACKPACK_NEW;
  const saved = await new Promise<boolean>(resolve => {
    backpackApi.saveBlobFile(
      newFileName,
      blob,
      () => {
        errorCallback(
          `Error saving ${newFileName} to your Backpack. Please try again`
        );
        resolve(false);
      },
      () => {
        sendLab2AnalyticsEvent(eventName, {fileType: 'png'});
        resolve(true);
      }
    );
  });

  if (!unifiedApi || !saved || !isDuplicateFileName) {
    return;
  }

  // Writes go to the universal backpack, so a name replaced in a legacy backpack is
  // still there. Deleting it after the save keeps a failed save non-destructive.
  try {
    await unifiedApi.deleteFromLegacyBackpacks(newFileName, filenamesByAppType);
  } catch (error) {
    errorCallback(
      "We saved your sketch, but couldn't delete your old file. You can retry the delete in the Backpack."
    );
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .logError('Backpack duplicate delete error', error as Error);
  }
};
