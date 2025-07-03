import _ from 'lodash';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';

import {DEPRECATED_PROJECT_TYPES} from '@cdo/apps/constants';

import ProjectsList from './ProjectsList';
import StudentFilterDropdown, {ALL_STUDENTS} from './StudentFilterDropdown';

class SectionProjectsList extends Component {
  static propTypes = {
    localeCode: PropTypes.string,
    projectsData: PropTypes.array.isRequired,
    showProjectThumbnails: PropTypes.bool.isRequired,
    // The prefix for the code studio url in the current environment,
    // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string,
  };

  constructor(props) {
    super(props);

    const studentNames = SectionProjectsList.getStudentNames(
      props.projectsData
    );

    this.state = {
      studentNames,
      selectedStudent: ALL_STUDENTS,
    };
  }

  static getStudentNames(projectsData) {
    return _(projectsData)
      .map(p => p.studentName)
      .uniq()
      .sortBy()
      .value();
  }

  onChangeStudent(selectedStudent) {
    this.setState({selectedStudent});
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const studentNames = SectionProjectsList.getStudentNames(
      nextProps.projectsData
    );
    let newState = {studentNames};

    if (!studentNames.includes(this.state.selectedStudent)) {
      newState.selectedStudent = ALL_STUDENTS;
    }
    this.setState(newState);
  }

  render() {
    const studioUrlPrefix = this.props.studioUrlPrefix || '';
    const filteredProjectsData = this.props.projectsData
      .filter(project =>
        [ALL_STUDENTS, project['studentName']].includes(
          this.state.selectedStudent
        )
      )
      .filter(project => !DEPRECATED_PROJECT_TYPES.includes(project.type));

    return (
      <div>
        <div style={styles.filterRow}>
          <StudentFilterDropdown
            onChangeStudent={this.onChangeStudent.bind(this)}
            selectedStudent={this.state.selectedStudent}
            studentNames={this.state.studentNames}
            style={styles.filterComponent}
          />
          <div style={styles.clearDiv} />
        </div>
        <ProjectsList
          localeCode={this.props.localeCode}
          projectsData={filteredProjectsData}
          showProjectThumbnails={this.props.showProjectThumbnails}
          studioUrlPrefix={studioUrlPrefix}
        />
      </div>
    );
  }
}

const styles = {
  filterComponent: {
    float: 'right',
  },
  filterRow: {
    paddingBottom: 10,
  },
  clearDiv: {
    clear: 'both',
  },
};

export const UnconnectedSectionProjectsList = SectionProjectsList;

export default connect(state => ({
  studioUrlPrefix: state.teacherSections.studioUrlPrefix,
}))(SectionProjectsList);
