import _ from 'lodash';
import {navigateToHref} from '@cdo/apps/utils';
import {TeacherDashboardPath} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';
import firehoseClient from '../../lib/util/firehose';

export function switchToSection(toSectionId, fromSectionId) {
  const baseUrl = `/teacher_dashboard/sections/${toSectionId}/`;
  const currentTab = _.last(_.split(window.location.pathname, '/'));
  const teacherNavigationTabs = _.values(TeacherDashboardPath);
  const sectionUrl = _.includes(teacherNavigationTabs, `/${currentTab}`)
    ? baseUrl.concat(currentTab)
    : baseUrl;
  navigateToHref(sectionUrl);
}

export function recordSwitchToSection(toSectionId, fromSectionId, studyGroup) {
  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: studyGroup,
      event: 'change_section',
      data_json: JSON.stringify({
        section_id: fromSectionId,
        old_section_id: fromSectionId,
        new_section_id: toSectionId
      })
    },
    {includeUserId: true}
  );
}

export function recordOpenEditSectionDetails(sectionId, studyGroup) {
  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: studyGroup,
      event: 'open_edit_section_dashboard_header',
      data_json: JSON.stringify({
        section_id: sectionId
      })
    },
    {includeUserId: true}
  );
}
