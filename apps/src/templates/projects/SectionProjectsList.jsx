import React, {Component, PropTypes} from 'react';
import ProjectsList from './ProjectsList';
import StudentFilterDropdown from './StudentFilterDropdown';
import _ from 'lodash';
import color from "../../util/color";

const ALL_STUDENTS = '_all_students';

const styles = {
  filterComponent: {
    float: 'right',
  },
  filterRow: {
    backgroundColor: color.teal,
    borderBottom: 'solid 1px white',
    padding: 10,
  },
  clearDiv: {
    clear: 'both'
  }
};

class SectionProjectsList extends Component {
  constructor(props) {
    super(props);

    const studentNames = SectionProjectsList.getStudentNames(props.projectsData);

    this.state = {
      studentNames,
      selectedStudent: ALL_STUDENTS,
    };
  }

  onChangeStudent(selectedStudent) {
    this.setState({selectedStudent});
  }

  componentWillReceiveProps(nextProps) {
    const studentNames = SectionProjectsList.getStudentNames(nextProps.projectsData);
    let newState = {studentNames};

    if (!studentNames.includes(this.state.selectedStudent)) {
      newState.selectedStudent = ALL_STUDENTS;
    }
    this.setState(newState);
  }

  render() {
    const filteredProjectsData = this.props.projectsData.filter(project => (
      [ALL_STUDENTS, project['studentName']].includes(this.state.selectedStudent)
    ));

    return (
      <div>
        <div style={styles.filterRow}>
          <StudentFilterDropdown
            onChangeStudent={this.onChangeStudent.bind(this)}
            selectedStudent={this.state.selectedStudent}
            studentNames={this.state.studentNames}
            style={styles.filterComponent}
          />
          <div style={styles.clearDiv}></div>
        </div>
        <ProjectsList
          projectsData={filteredProjectsData}
          studioUrlPrefix={this.props.studioUrlPrefix}
        />
      </div>
    );
  }
}

SectionProjectsList.propTypes = {
  projectsData: PropTypes.array.isRequired,
  // The prefix for the code studio url in the current environment,
  // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
  studioUrlPrefix: PropTypes.string.isRequired,
};

SectionProjectsList.getStudentNames = function (projectsData) {
  return _(projectsData)
    .map(p => p.studentName)
    .uniq()
    .sortBy()
    .value();
};

export default SectionProjectsList;
