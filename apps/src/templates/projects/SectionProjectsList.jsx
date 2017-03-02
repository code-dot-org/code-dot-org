import React from 'react';
import ProjectsList from './ProjectsList';
import _ from 'lodash';
import color from "../../util/color";

const ALL_STUDENTS = '_all_students';

const styles = {
  filterDropdown: {
    margin: 0,
    color: 'dimgray'
  },
  filterRow: {
    backgroundColor: color.teal,
    borderBottom: 'solid 1px white',
    color: color.white,
    padding: 10,
    fontSize: 14
  },
  filterSpan: {
    float: 'right',
    display: 'inline-flex',
    alignItems: 'center',
  },
  clearDiv: {
    clear: 'both'
  }
};

class SectionProjectsList extends React.Component {
  constructor(props) {
    super(props);

    const studentNames = this.getStudentNames(props.projectsData);

    this.state = {
      studentNames,
      selectedStudent: ALL_STUDENTS,
    };
  }

  getStudentNames(projectsData) {
    const studentsMap = {};
    projectsData.forEach(project => {
      studentsMap[project['studentName']] = true;
    });
    return Object.keys(studentsMap);
  }

  onChangeStudent(event) {
    const selectedStudent = event.target.value;
    this.setState({selectedStudent});
  }

  componentWillReceiveProps(nextProps) {
    if (_.isEqual(nextProps, this.props)) {
      return;
    }

    const studentNames = this.getStudentNames(nextProps.projectsData);
    this.setState({studentNames});
  }

  render() {
    const filteredProjectsData = this.props.projectsData.filter(project => (
      [ALL_STUDENTS, project['studentName']].includes(this.state.selectedStudent)
    ));

    return (
      <div>
        <div style={styles.filterRow}>
          <span style={styles.filterSpan}>
            Filter by student:&nbsp;
            <select
              value={this.state.selectedStudent}
              onChange={this.onChangeStudent.bind(this)}
              style={styles.filterDropdown}
            >
              <option value={ALL_STUDENTS} key={ALL_STUDENTS}>All</option>
              {
                this.state.studentNames.map(studentName => (
                  <option value={studentName} key={studentName}>{studentName}</option>
                ))
              }
            </select>
          </span>
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
  projectsData: React.PropTypes.array.isRequired,
  // The prefix for the code studio url in the current environment,
  // e.g. '//studio.code.org' or '//localhost-studio.code.org:3000'.
  studioUrlPrefix: React.PropTypes.string.isRequired,
};

export default SectionProjectsList;
