import React, {Component} from 'react';
import NavigationBar from '../NavigationBar';
import i18n from '@cdo/locale';

export const TeacherDashboardPath = {
  progress: '/progress',
  textResponses: '/text_responses',
  assessments: '/assessments',
  projects: '/projects',
  stats: '/stats',
  manageStudents: '/manage_students',
  loginInfo: '/login_info'
};

const teacherDashboardLinks = [
  {
    label: i18n.teacherTabProgress(),
    url: TeacherDashboardPath.progress
  },
  {
    label: i18n.teacherTabStatsTextResponses(),
    url: TeacherDashboardPath.textResponses
  },
  {
    label: i18n.teacherTabAssessments(),
    url: TeacherDashboardPath.assessments
  },
  {
    label: i18n.teacherTabProjects(),
    url: TeacherDashboardPath.projects
  },
  {
    label: i18n.teacherTabStats(),
    url: TeacherDashboardPath.stats
  },
  {
    label: i18n.teacherTabManageStudents(),
    url: TeacherDashboardPath.manageStudents
  }
];

export default class TeacherDashboardNavigation extends Component {
  render() {
    return <NavigationBar links={teacherDashboardLinks} />;
  }
}
