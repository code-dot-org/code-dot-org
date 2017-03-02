import React from 'react';
import ProjectsList from './ProjectsList';
import _ from 'lodash';

class SectionProjectsList extends React.Component {
  constructor(props) {
    super(props);

    const studentNames = this.getStudentNames(props.projectsData);

    this.state = {
      studentNames,
      // Show all students
      selectedStudent: '',
    };
  }

  getStudentNames(projectsData) {
    const studentsMap = {};
    projectsData.forEach(project => {
      const studentName = project['studentName'];
      if (studentName) {
        studentsMap[studentName] = true;
      }
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
      !this.state.selectedStudent ||
        (this.state.selectedStudent === project['studentName'])
    ));

    return (
      <div>
        <select
          value={this.state.selectedStudent}
          onChange={this.onChangeStudent.bind(this)}
        >
          <option value="">All Students</option>
          {
            this.state.studentNames.map(studentName => (
              <option value={studentName}>{studentName}</option>
            ))
          }
        </select>
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
