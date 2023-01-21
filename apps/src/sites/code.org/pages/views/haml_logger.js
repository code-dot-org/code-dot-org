import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const page_to_event_map = {
  Administrators: EVENTS.ADMIN_PAGE_VISITED_EVENT,
  CSA_Curriculum: EVENTS.CSA_CURRICULUM_PAGE_VISITED_EVENT
};

$(document).ready(e => {
  const haml_logger = $('#haml-logger');
  const sourcePageId = haml_logger.data('page-visited');
  analyticsReporter.sendEvent(page_to_event_map[sourcePageId]);
});
