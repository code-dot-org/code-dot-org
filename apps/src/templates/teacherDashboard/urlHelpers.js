const dashboardPrefix = '/teacher_dashboard/sections/';
import {navigateToHref} from '@cdo/apps/utils';
import {TeacherDashboardPath} from '@cdo/apps/templates/teacherDashboard/TeacherDashboardNavigation';

/**
 * Returns the URL in teacher dashboard given a section id and (optional) path.
 */
export const teacherDashboardUrl = (sectionId, path = '') => {
  // Prepend a forward slash to path if one is not supplied.
  if (path && path.at(0) !== '/') {
    path = '/${path}';
  }

  return dashboardPrefix + sectionId + path;
};


export const scriptUrlForStudent = (sectionId, scriptName, studentId) => {
  if (!scriptName) {
    return null;
  }

  return `/s/${scriptName}?section_id=${sectionId}&user_id=${studentId}&viewAs=Teacher`;
};

export const switchToSection = (toSectionId, fromSectionId) => {
  const baseUrl = `/teacher_dashboard/sections/${toSectionId}/`;
  const currentTab = _.last(_.split(window.location.pathname, '/'));
  const teacherNavigationTabs = _.values(TeacherDashboardPath);
  const sectionUrl = _.includes(teacherNavigationTabs, `/${currentTab}`)
    ? baseUrl.concat(currentTab)
    : baseUrl;
  navigateToHref(sectionUrl);

  firehoseClient.putRecord(
    {
      study: 'teacher_dashboard_actions',
      study_group: currentTab,
      event: 'change_section',
      data_json: JSON.stringify({
        section_id: fromSectionId,
        old_section_id: fromSectionId,
        new_section_id: toSectionId
      })
    },
    {includeUserId: true}
  );
};
