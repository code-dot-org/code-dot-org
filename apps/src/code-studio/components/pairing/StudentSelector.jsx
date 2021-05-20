import PropTypes from 'prop-types';
import React from 'react';
import {studentsShape} from './types';
import i18n from '@cdo/locale';
import color from '@cdo/apps/util/color';

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

  handleStudentClicked = event => {
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

  handleSubmit = event => {
    this.props.handleSubmit(this.state.selectedStudentIds);
    event.preventDefault();
  };

  render() {
    if (!this.props.students) {
      return null;
    } else if (this.props.students.length === 0) {
      return <span>{i18n.noStudentsInSection()}</span>;
    }
    const {students} = this.props;
    const {selectedStudentIds} = this.state;
    const exceededMaximum = selectedStudentIds.length >= 4;

    const studentBtns = students.map(student => {
      let className = 'student selected';
      let disabled = false;
      if (selectedStudentIds.indexOf(student.id) === -1) {
        className = 'student selectable';
        disabled = exceededMaximum;
      }
      let buttonStyle = styles.enabled;

      //Adjust styles for disabled and selected buttons
      if (disabled) {
        buttonStyle = {...buttonStyle, ...styles.disabled};
      } else if (className.includes('selected')) {
        buttonStyle = {...buttonStyle, ...styles.selected};
      }

      return (
        <button
          type="button"
          key={student.id}
          data-id={student.id}
          className={className}
          onClick={this.handleStudentClicked}
          style={buttonStyle}
          disabled={disabled}
        >
          {student.name}
        </button>
      );
    });
    return (
      <div>
        {studentBtns}
        <div className="clear" />
        {exceededMaximum && (
          <p style={styles.warning}>{i18n.exceededPairProgrammingMax()}</p>
        )}
        {selectedStudentIds.length !== 0 && (
          <button
            style={styles.buttonLeft}
            type="button"
            onClick={this.handleSubmit}
            className="addPartners"
          >
            {i18n.addPartners()}
          </button>
        )}
      </div>
    );
  }
}

// see pairing.scss for general button styling
const styles = {
  buttonLeft: {
    marginLeft: 0
  },
  enabled: {
    backgroundColor: 'white',
    fontSize: '13px'
  },
  warning: {
    color: 'red',
    fontFamily: "'Gotham 4r', sans-serif",
    fontSize: '12px',
    paddingTop: '5px'
  },
  disabled: {
    opacity: 0.5
  },
  selected: {
    backgroundColor: color.cyan,
    color: 'white'
  }
};
