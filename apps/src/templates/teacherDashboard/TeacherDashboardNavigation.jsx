import React, {Component} from 'react';
import NavigationBar from '../NavigationBar';
import i18n from "@cdo/locale";

const teacherDashboardLinks = [
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
  render() {
    return (
      <NavigationBar
        links = {teacherDashboardLinks}
      />
    );
  }
}
