import $ from 'jquery';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';

const page_to_event_map = {
  Homepage: EVENTS.HOMEPAGE_VISITED_EVENT,
  Administrators: EVENTS.ADMIN_PAGE_VISITED_EVENT,
  CSA_Curriculum: EVENTS.CSA_CURRICULUM_PAGE_VISITED_EVENT,
  CSD_Curriculum: EVENTS.CSD_CURRICULUM_PAGE_VISITED_EVENT,
  CSF_Curriculum: EVENTS.CSF_CURRICULUM_PAGE_VISITED_EVENT,
  CSP_Curriculum: EVENTS.CSP_CURRICULUM_PAGE_VISITED_EVENT,
  Elementary_School_Curriculum: EVENTS.ELEMENTARY_CURRICULUM_PAGE_VISITED_EVENT,
  Middle_School_Curriculum: EVENTS.MIDDLE_SCHOOL_CURRICULUM_PAGE_VISITED_EVENT,
  High_School_Curriculum: EVENTS.HIGH_SCHOOL_CURRICULUM_PAGE_VISITED_EVENT,
  Elementary_School_PL: EVENTS.ELEMENTARY_SCHOOL_PL_PAGE_VISITED_EVENT,
  Middle_And_High_School_PL:
    EVENTS.MIDDLE_AND_HIGH_SCHOOL_PL_PAGE_VISITED_EVENT,
  Pick_PL: EVENTS.PICK_PL_PAGE_VISITED_EVENT,
  RP_Landing: EVENTS.RP_LANDING_PAGE_VISITED_EVENT
};

$(document).ready(() => {
  const haml_logger = document.getElementById('haml-logger');
  const sourcePageId = haml_logger.dataset.pageVisited;
  analyticsReporter.sendEvent(page_to_event_map[sourcePageId]);
});
