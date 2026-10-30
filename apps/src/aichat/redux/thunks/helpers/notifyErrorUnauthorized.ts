import {
  AI_CHAT_NOT_AUTHORIZED_STUDENT,
  AI_CHAT_NOT_AUTHORIZED_TEACHER,
} from '@cdo/apps/aichat/constants';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {getNewRemoveId} from '../../utils';
import {addChatEvent} from '../addChatEvent';
import {sendAnalytics} from '../sendAnalytics';

export async function notifyErrorUnauthorized(
  error: NetworkError,
  userAction: string,
  dispatch: AppDispatch
) {
  let userType;
  try {
    const responseBody = await error.response.json();
    userType = responseBody?.user_type;
  } catch (error) {
    // This can happen if the 403 response is not JSON.
    console.warn(error);
  }

  const userTypeToMessageText: {[key: string]: string} = {
    teacher: AI_CHAT_NOT_AUTHORIZED_TEACHER,
    student: AI_CHAT_NOT_AUTHORIZED_STUDENT,
  };
  const messageText =
    userTypeToMessageText[userType] ||
    commonI18n.aiChatNotAuthorizedSignedOut();

  dispatch(
    addChatEvent({
      removeId: getNewRemoveId(),
      text: messageText,
      notificationType: 'permissionsError',
      timestamp: Date.now(),
    })
  );
  dispatch(
    sendAnalytics(EVENTS.SUBMIT_AICHAT_REQUEST_UNAUTHORIZED, {
      userType,
      userAction,
    })
  );
}
