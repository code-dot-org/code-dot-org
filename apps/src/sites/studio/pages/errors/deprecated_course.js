import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import getScriptData from '@cdo/apps/util/getScriptData';

$(() => {
  const deprecatedCurriculumName = getScriptData('deprecatedCurriculumName');
  analyticsReporter.sendEvent(EVENTS.DEPRECATED_CURRICULUM_ERROR_PAGE_VISITED, {
    deprecatedCurriculumName,
  });
});
