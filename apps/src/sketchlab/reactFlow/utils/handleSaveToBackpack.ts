import {type ReactFlowInstance} from '@xyflow/react';

import {ShareFailure, ShareFailureType} from '@cdo/apps/lab2/types';
import {sendLab2AnalyticsEvent} from '@cdo/apps/lab2/utils';
import {
  DialogControlInterface,
  DialogType,
  extractUserInput,
} from '@cdo/apps/lab2/views/dialogs';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import BackpackClientApi from '@cdo/apps/sharedComponents/backpack/BackpackClientApi';

import {createSketchSnapshotBlob} from './createSketchSnapshotBlob';

export const SAVE_BLOCKED_TITLE = "This sketch can't be saved to your Backpack";

const CONTACT_SUPPORT =
  'If you think this is a mistake, contact support@code.org.';

export const ABUSE_BLOCKED_MESSAGE =
  'This sketch was flagged for content that violates our Terms of Service, ' +
  'so it cannot be copied to your Backpack. If an image you added was ' +
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
  backpackApi: BackpackClientApi | undefined,
  dialogControl: DialogControlInterface,
  backpackFileList: string[],
  errorCallback: (error: string) => void,
  moderationState: {
    isBlockedAbuse?: boolean;
    shareFailure?: ShareFailure | null;
  }
) => {
  if (!reactFlow || !backpackApi) {
    return;
  }

  // A flagged sketch must not be copied into the Backpack, where it would
  // outlive the moderation state attached to this project.
  const blockedMessage = moderationState.isBlockedAbuse
    ? ABUSE_BLOCKED_MESSAGE
    : moderationState.shareFailure
    ? getShareFailureMessage(moderationState.shareFailure)
    : undefined;
  if (blockedMessage) {
    await dialogControl.showDialog({
      type: DialogType.GenericAlert,
      title: SAVE_BLOCKED_TITLE,
      message: blockedMessage,
    });
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

  const eventName = backpackFileList.includes(newFileName)
    ? EVENTS.SAVE_TO_BACKPACK_REPLACE
    : EVENTS.SAVE_TO_BACKPACK_NEW;
  backpackApi.saveBlobFile(
    newFileName,
    blob,
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
