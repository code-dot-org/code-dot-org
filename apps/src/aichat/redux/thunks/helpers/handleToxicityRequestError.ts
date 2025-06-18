import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {endSave} from '../../slice';

import {dispatchSaveFailNotification} from './dispatchSaveFailNotification';
import {notifyErrorUnauthorized} from './notifyErrorUnauthorized';

export async function handleToxicityRequestError(
  error: Error,
  dispatch: AppDispatch
) {
  if (error instanceof NetworkError && error.response.status === 403) {
    await notifyErrorUnauthorized(error, 'Model Customization', dispatch);
  } else {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.CustomizationToxicityScreeningErrorUnhandled');
    // Default save error message.
    const errorMessage =
      'There was an error saving your project. Please try again.';
    dispatchSaveFailNotification(dispatch, errorMessage);
  }
  dispatch(endSave());
}
