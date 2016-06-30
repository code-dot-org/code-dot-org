import React from 'react';

/**
 * A component for selecting one or more students in a section.
 */
const StudentSelector = React.createClass({
  getInitialState() {
    return {
      selectedStudentIds: []
    };
  },

  handleStudentClicked(event) {
    var selectedStudentIds = this.state.selectedStudentIds;
    var studentId = +event.target.getAttribute('data-id');
    var index = selectedStudentIds.indexOf(studentId);
    if (index === -1) {
      // not selected, select it
      selectedStudentIds.push(studentId);
    } else {
      // selected, unselect it
      selectedStudentIds.splice(index, 1);
    }
    this.setState({selectedStudentIds: selectedStudentIds});
  },

  handleSubmit(event) {
    this.props.handleSubmit(this.state.selectedStudentIds);
    event.preventDefault();
  },

  render() {
    if (!this.props.students) {
      return null;
    } else if (this.props.students.length === 0) {
      return <span>There are no other students in this section.</span>;
    }

    var studentDivs = this.props.students.map(student => {
      var className = "student selectable";
      if (this.state.selectedStudentIds.indexOf(student.id) !== -1) {
        className = "student selectable selected";
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
        <div className="clear"></div>
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
});
export default StudentSelector;
