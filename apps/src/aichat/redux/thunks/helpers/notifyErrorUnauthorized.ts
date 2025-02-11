import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {commonI18n} from '@cdo/apps/types/locale';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {getNewMessageId} from '../../utils';
import {addChatEvent} from '../addChatEvent';
import {sendAnalytics} from '../sendAnalytics';

export async function notifyErrorUnauthorized(
  error: NetworkError,
  userAction: string,
  dispatch: AppDispatch
) {
  const responseBody = await error.response.json();
  const userType = responseBody?.user_type;

  const userTypeToMessageText: {[key: string]: string} = {
    teacher: commonI18n.aiChatNotAuthorizedTeacher(),
    student: commonI18n.aiChatNotAuthorizedStudent(),
  };
  const messageText =
    userTypeToMessageText[userType] ||
    commonI18n.aiChatNotAuthorizedSignedOut();

  dispatch(
    addChatEvent({
      id: getNewMessageId(),
      text: messageText,
      notificationType: 'permissionsError',
      timestamp: Date.now(),
    })
  );
  dispatch(
    sendAnalytics(
      EVENTS.SUBMIT_AICHAT_REQUEST_UNAUTHORIZED,
      {
        levelPath: window.location.pathname,
        userType,
        userAction,
      },
      true
    )
  );
}
