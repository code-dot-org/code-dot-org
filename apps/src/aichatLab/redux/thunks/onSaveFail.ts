import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {AppDispatch} from '@cdo/apps/util/reduxHooks';

import {dispatchSaveFailNotification} from './helpers/dispatchSaveFailNotification';

// Thunk called when a save has failed.
export const onSaveFail = () => (dispatch: AppDispatch) => {
  Lab2Registry.getInstance()
    .getMetricsReporter()
    .incrementCounter('Aichat.SaveFailError');
  dispatchSaveFailNotification(dispatch, 'genericError');
};
