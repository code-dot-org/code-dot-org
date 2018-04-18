import React, { Component, PropTypes } from 'react';
import {h3Style} from "../../lib/ui/Headings";
import i18n from '@cdo/locale';

const styles = {
  dropdown: {
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
    lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired,
  };

  render() {
    const { onChange, lessons } = this.props;

    return (
      <div>
        <div style={{...h3Style, ...styles.heading}}>
          {i18n.jumpToLesson()}
        </div>
        <select
          onChange={event => onChange(parseInt(event.target.value))}
          style={styles.dropdown}
        >
          {lessons.map((lesson) => (
            <option
              value={lesson.position}
              key={lesson.id}
            >
              {lesson.position}: {lesson.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}
