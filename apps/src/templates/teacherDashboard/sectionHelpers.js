import _ from 'lodash';

import {navigateToHref} from '@cdo/apps/utils';

import harness from '../../lib/util/harness';

import {TEACHER_DASHBOARD_PATHS} from './TeacherDashboardNavigation';

export function switchToSection(toSectionId, fromSectionId) {
  const baseUrl = `/teacher_dashboard/sections/${toSectionId}/`;
  const currentTab = _.last(_.split(window.location.pathname, '/'));
  const teacherNavigationTabs = _.values(TEACHER_DASHBOARD_PATHS);
  const sectionUrl = teacherNavigationTabs.includes(`/${currentTab}`)
    ? baseUrl.concat(currentTab)
    : baseUrl;
  navigateToHref(sectionUrl);
}

export function recordSwitchToSection(toSectionId, fromSectionId, studyGroup) {
  harness.trackAnalytics(
    {
      study: 'teacher_dashboard_actions',
      study_group: studyGroup,
      event: 'change_section',
      data_json: JSON.stringify({
        section_id: fromSectionId,
        old_section_id: fromSectionId,
        new_section_id: toSectionId,
      }),
    },
    {includeUserId: true}
  );
}

export function recordOpenEditSectionDetails(sectionId, studyGroup) {
  harness.trackAnalytics(
    {
      study: 'teacher_dashboard_actions',
      study_group: studyGroup,
      event: 'open_edit_section_dashboard_header',
      data_json: JSON.stringify({
        section_id: sectionId,
      }),
    },
    {includeUserId: true}
  );
}
