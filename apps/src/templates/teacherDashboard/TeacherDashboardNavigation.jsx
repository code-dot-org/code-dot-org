import React, {Component, PropTypes} from 'react';
import NavigationBar from '../NavigationBar';
import i18n from "@cdo/locale";

export const teacherDashboardLinks = [
  {
    label: i18n.teacherTabManageStudents(),
    url: "manage_students"
  },
  {
    label: i18n.teacherTabProjects(),
    url: "projects"
  },
  {
    label: i18n.teacherTabStats(),
    url: "stats"
  },
  {
    label: i18n.teacherTabStatsTextResponses(),
    url: "text_responses"
  },
  {
    label: i18n.teacherTabProgress(),
    url: "progress"
  },
  {
    label: i18n.teacherTabAssessments(),
    url: "assessments"
  },
];

export default class TeacherDashboardNavigation extends Component {
  static propTypes = {
    defaultActiveLink: PropTypes.string,
  };

  render() {
    return (
      <NavigationBar
        defaultActiveLink = {this.props.defaultActiveLink}
        links = {teacherDashboardLinks}
      />
    );
  }
}
