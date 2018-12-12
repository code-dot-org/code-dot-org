import React, {Component, PropTypes} from 'react';
import NavigationBar from '../NavigationBar';

export default class TeacherDashboardNavigation extends Component {
  static propTypes = {
    defaultActiveLink: PropTypes.string,
  };

  render() {

    const links = [
      {
        id: "manageStudents",
        label: "Manage Students",
        url: "manage_students"
      },
      {
        id: "projects",
        label: "Projects",
        url: "projects"
      },
      {
        id: "stats",
        label: "Stats",
        url: "stats"
      },
      {
        id: "textResponses",
        label: "Text Responses",
        url: "text_responses"
      },
      {
        id: "progress",
        label: "Progress",
        url: "progress"
      },
      {
        id: "assessments",
        label: "Assessments/Surveys",
        url: "assessments"
      },
    ];

    return (
      <NavigationBar
        defaultActiveLink = {this.props.defaultActiveLink}
        links = {links}
      />
    );
  }
}
