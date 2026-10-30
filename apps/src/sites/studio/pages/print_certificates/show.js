import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {getStore} from '@cdo/apps/redux';

$(() => {
  const isTeacher = getStore().getState().currentUser.userType === 'teacher';
  if (isTeacher) {
    analyticsReporter.sendEvent(EVENTS.CERTIFICATE_PRINT_PAGE_VISITED);
  }
});
