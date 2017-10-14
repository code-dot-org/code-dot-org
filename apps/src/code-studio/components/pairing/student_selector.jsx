import React, {PropTypes} from 'react';
import { studentsShape } from './types';

/**
 * A component for selecting one or more students in a section.
 */
export default class StudentSelector extends React.Component {
  static propTypes = {
    students: studentsShape,
    handleSubmit: PropTypes.func.isRequired
  };

  state = {
    selectedStudentIds: []
  };

  handleStudentClicked = (event) => {
    const selectedStudentIds = [...this.state.selectedStudentIds];
    const studentId = +event.target.getAttribute('data-id');
    const index = selectedStudentIds.indexOf(studentId);
    if (index === -1) {
      // not selected, select it
      selectedStudentIds.push(studentId);
    } else {
      // selected, unselect it
      selectedStudentIds.splice(index, 1);
    }
    this.setState({selectedStudentIds});
  };

  handleSubmit = (event) => {
    this.props.handleSubmit(this.state.selectedStudentIds);
    event.preventDefault();
  };

  render() {
    if (!this.props.students) {
      return null;
    } else if (this.props.students.length === 0) {
      return <span>There are no other students in this section.</span>;
    }

    const studentDivs = this.props.students.map(student => {
      let className = 'student selectable';
      if (this.state.selectedStudentIds.indexOf(student.id) !== -1) {
        className = 'student selectable selected';
      }
      return (
        <div
          key={student.id}
          data-id={student.id}
          className={className}
          onClick={this.handleStudentClicked}
        >
          {student.name}
        </div>
      );
    });

    return (
      <div>
        {studentDivs}
        <div className="clear"/>
        {(this.state.selectedStudentIds.length !== 0) &&
          <button
            onClick={this.handleSubmit}
            className="addPartners"
          >
            Add Partners
          </button>
        }
      </div>
    );
  }
}
