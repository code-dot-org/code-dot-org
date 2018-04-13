import React, { Component, PropTypes } from 'react';
import {h3Style} from "../../lib/ui/Headings";

const styles = {
  dropdown: {
    width: 250,
    display: 'block',
    boxSizing: 'border-box',
    fontSize: 'medium',
    padding: '0.8em',
    marginBottom: 10,
  },
  heading: {
    marginBottom: 0,
  },
};

export default class LessonSelector extends Component {
  static propTypes = {
    lessonNumbers: PropTypes.arrayOf(PropTypes.number),
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { onChange, lessonNumbers } = this.props;

    return (
      <div>
        <div style={{...h3Style, ...styles.heading}}>
          Jump to lesson:
        </div>
        <select
          onChange={event => onChange(parseInt(event.target.value))}
          style={styles.dropdown}
        >
          {lessonNumbers.map((lessonNumber) => (
            <option
              value={lessonNumber}
              key={lessonNumber}
            >
              Lesson {lessonNumber}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
