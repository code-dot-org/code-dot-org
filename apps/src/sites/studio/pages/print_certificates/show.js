import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

$(() => {
  analyticsReporter.sendEvent(EVENTS.CERTIFICATE_PRINT_PAGE_VISITED);
});
