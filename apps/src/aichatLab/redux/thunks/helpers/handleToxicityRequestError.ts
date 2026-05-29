import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {endSave} from '../../slice';

import {dispatchSaveFailNotification} from './dispatchSaveFailNotification';

export async function handleToxicityRequestError(
  error: Error,
  dispatch: AppDispatch
) {
  if (error instanceof NetworkError && error.response.status === 403) {
    dispatchSaveFailNotification(dispatch, 'permissionsError');
  } else {
    Lab2Registry.getInstance()
      .getMetricsReporter()
      .incrementCounter('Aichat.CustomizationToxicityScreeningErrorUnhandled');
    dispatchSaveFailNotification(dispatch, 'genericError');
  }
  dispatch(endSave());
}
