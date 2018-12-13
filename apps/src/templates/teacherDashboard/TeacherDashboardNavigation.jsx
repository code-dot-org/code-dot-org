import React, {Component, PropTypes} from 'react';
import NavigationBar from '../NavigationBar';

export const teacherDashboardLinks = [
  {
    label: "Manage Students",
    url: "manage_students"
  },
  {
    label: "Projects",
    url: "projects"
  },
  {
    label: "Stats",
    url: "stats"
  },
  {
    label: "Text Responses",
    url: "text_responses"
  },
  {
    label: "Progress",
    url: "progress"
  },
  {
    label: "Assessments/Surveys",
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
