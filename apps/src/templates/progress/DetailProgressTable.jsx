import PropTypes from 'prop-types';
import React from 'react';
import ProgressLesson from './ProgressLesson';
import {lessonType} from './progressTypes';

/**
 * A component that shows progress in a course with more detail than the summary
 * view
 */
export default class DetailProgressTable extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(lessonType).isRequired
  };

  render() {
    return (
      <div>
        {this.props.lessons.map((lesson, index) => (
          <ProgressLesson key={index} lesson={lesson} />
        ))}
      </div>
    );
  }
}
