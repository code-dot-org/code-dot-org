import React, {Component, PropTypes} from 'react';
import ProjectsList from './ProjectsList';
import StudentFilterDropdown, {ALL_STUDENTS} from './StudentFilterDropdown';
import _ from 'lodash';
import color from "../../util/color";

const styles = {
  filterComponent: {
    float: 'right',
  },
  filterRow: {
    backgroundColor: color.table_header,
    borderBottom: 'solid 1px white',
    padding: 10,
  },
  clearDiv: {
    clear: 'both'
  }
};

class SectionProjectsList extends Component {
  static propTypes = {
    projectsData: PropTypes.array.isRequired,
    // The prefix for the code studio url in the current environment,
    // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
    studioUrlPrefix: PropTypes.string.isRequired,
    showProjectThumbnails: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    const studentNames = SectionProjectsList.getStudentNames(props.projectsData);

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
          showProjectThumbnails={this.props.showProjectThumbnails}
        />
      </div>
    );
  }
}
export default SectionProjectsList;
