import React, { PropTypes } from 'react';
import ProgressLesson from './ProgressLesson';
import { levelType, lessonType } from './progressTypes';

/**
 * A component that shows progress in a course with more detail than the summary
 * view
 */
export default class DetailProgressTable extends React.Component {
  static propTypes = {
    lessons: PropTypes.arrayOf(lessonType).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired
  };

  render() {
    const { lessons, levelsByLesson } = this.props;
    if (lessons.length !== levelsByLesson.length) {
      throw new Error('Inconsistent number of lessons');
    }

    return (
      <div>
        {lessons.map((lesson, index) => (
          <ProgressLesson
            key={index}
            lesson={lesson}
            levels={levelsByLesson[index]}
          />
        ))}
      </div>
    );
  }
}
