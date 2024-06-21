import moment from 'moment';

import {getTypedKeys} from '@cdo/apps/types/utils';

import {
  AichatCompletionMessage,
  AiCustomizations,
  ChatCompletionMessage,
  FieldVisibilities,
  ModelCardInfo,
  Visibility,
} from '../types';

// This variable keeps track of the most recent message ID so that we can
// assign a unique message id in increasing sequence to a new message.
let latestMessageId = 0;
export const getNewMessageId = () => {
  latestMessageId += 1;
  return latestMessageId;
};

export const getCurrentTimestamp = () =>
  moment(Date.now()).format('YYYY-MM-DD HH:mm');
export const getCurrentTime = () => moment(Date.now()).format('LT');

const haveDifferentValues = (
  value1: AiCustomizations[keyof AiCustomizations],
  value2: AiCustomizations[keyof AiCustomizations]
): boolean => {
  if (typeof value1 === 'object' && typeof value2 === 'object') {
    return JSON.stringify(value1) !== JSON.stringify(value2);
  }

  return value1 !== value2;
};

// Used to decide which model customizations have changed
// between the previous save and the current one,
// such that we can display a notification for each to users.
export const findChangedProperties = (
  previous: AiCustomizations | undefined,
  next: AiCustomizations
) => {
  if (!previous) {
    return Object.keys(next);
  }

  const changedProperties: string[] = [];
  Object.keys(next).forEach(key => {
    const typedKey = key as keyof AiCustomizations;
    if (haveDifferentValues(previous[typedKey], next[typedKey])) {
      changedProperties.push(key);
    }
  });

  return changedProperties;
};

// Used to decide whether to unpublish a project based on whether
// it has its model card filled out or not.
export const hasFilledOutModelCard = (modelCardInfo: ModelCardInfo) => {
  for (const key of getTypedKeys(modelCardInfo)) {
    if (key === 'isPublished') {
      continue;
    } else if (key === 'exampleTopics') {
      if (
        !modelCardInfo['exampleTopics'].filter(topic => topic.length).length
      ) {
        return false;
      }
    } else if (!modelCardInfo[key].length) {
      return false;
    }
  }

  return true;
};

export const allFieldsHidden = (fieldVisibilities: FieldVisibilities) =>
  getTypedKeys(fieldVisibilities).every(
    key => fieldVisibilities[key] === Visibility.HIDDEN
  );

// Opposite of decorateMessageFromModelResponse.
// Preps messages to send to model for response.
export const prepMessageForModelInput = (
  message: ChatCompletionMessage
): AichatCompletionMessage => {
  return {
    role: message.role,
    chatMessageText: message.chatMessageText,
    status: message.status,
  };
};

// Opposite of trimMessageForModelInput.
// Adds front-end specific information (message ID, timestamp)
// to messages received from model.
export const decorateMessageFromModelResponse = (
  responseMessage: AichatCompletionMessage
): ChatCompletionMessage => {
  return {
    ...responseMessage,
    id: getNewMessageId(),
    timestamp: getCurrentTimestamp(),
  };
};
