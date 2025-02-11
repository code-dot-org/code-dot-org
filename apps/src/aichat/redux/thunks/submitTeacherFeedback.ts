import {createAsyncThunk} from '@reduxjs/toolkit';

import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {postSubmitTeacherFeedback} from '../../aichatApi';
import {FeedbackValue} from '../../types';
import {updateChatMessageFeedback} from '../slice';

import {sendAnalytics} from './sendAnalytics';

// This thunk's callback function submits teacher feedback on a chat message.
export const submitTeacherFeedback = createAsyncThunk<
  void,
  {id: number; feedback: FeedbackValue | undefined},
  {dispatch: AppDispatch}
>('aichat/submitTeacherFeedback', async ({id, feedback}, {dispatch}) => {
  try {
    await postSubmitTeacherFeedback(id, feedback);
    dispatch(
      sendAnalytics(EVENTS.SUBMIT_AICHAT_TEACHER_FEEDBACK, {
        levelPath: window.location.pathname,
        feedback: feedback,
      })
    );
    dispatch(updateChatMessageFeedback({id, feedback}));
  } catch (error) {
    // Only send log report if not a 403 error.
    if (!(error instanceof NetworkError && error.response.status === 403)) {
      Lab2Registry.getInstance()
        .getMetricsReporter()
        .logError('Error submitting teacher feedback', error as Error);
    }
    return;
  }
});
