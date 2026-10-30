import {getNewRemoveId} from '@cdo/apps/aichat/redux/utils';
import {
  AI_TUTOR_VERSION_ACTION_REJECT,
  Notification,
} from '@cdo/apps/aichat/types/chatEvents';
import {ProjectFile} from '@cdo/apps/lab2/types';

const getRejectNotification = (files: ProjectFile[]): Notification => {
  return {
    timestamp: Date.now(),
    removeId: getNewRemoveId(),
    text: "You rejected AI Tutor's changes.",
    notificationType: AI_TUTOR_VERSION_ACTION_REJECT,
    includeInChatHistory: true,
    files: files,
  };
};

export default getRejectNotification;
