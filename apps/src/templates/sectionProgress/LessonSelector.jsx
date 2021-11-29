import PropTypes from 'prop-types';
import React, {Component} from 'react';
import {connect} from 'react-redux';
import {h3Style} from '../../lib/ui/Headings';
import i18n from '@cdo/locale';

class LessonSelector extends Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(PropTypes.object).isRequired,
    onChange: PropTypes.func.isRequired,
    lessonOfInterest: PropTypes.number.isRequired
  };

  render() {
    const {onChange, lessons} = this.props;

    return (
      <div>
        <div style={{...h3Style, ...styles.heading}}>{i18n.jumpToLesson()}</div>
        <select
          onChange={event => onChange(parseInt(event.target.value))}
          style={styles.dropdown}
          value={this.props.lessonOfInterest}
        >
          {lessons.map(lesson => (
            <option value={lesson.position} key={lesson.id}>
              {lesson.numberedLesson ? `${lesson.relative_position}:` : '--'}{' '}
              {lesson.name}
            </option>
          ))}
        </select>
      </div>
    );
  }
}

const styles = {
  dropdown: {
    display: 'block',
    boxSizing: 'border-box',
    fontSize: 'medium',
    height: 34,
    paddingLeft: 5,
    paddingRight: 5,
    width: 300
  },
  heading: {
    marginBottom: 0
  }
};

export const UnconnectedLessonSelector = LessonSelector;

export default connect(state => ({
  lessonOfInterest: state.sectionProgress.lessonOfInterest
}))(LessonSelector);
