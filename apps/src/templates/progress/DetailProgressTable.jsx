import React, { PropTypes } from 'react';
import ProgressLesson from './ProgressLesson';
import i18n from '@cdo/locale';
import { levelType } from './progressTypes';

/**
 * A component that shows progress in a course with more detail than the summary
 * view
 */
const DetailProgressTable = React.createClass({
  propTypes: {
    lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    levelsByLesson: PropTypes.arrayOf(
      PropTypes.arrayOf(levelType)
    ).isRequired,
  },

  render() {
    const { lessonNames, levelsByLesson } = this.props;
    return (
      <div>
        {lessonNames.map((lessonName, index) => (
          <ProgressLesson
            key={index}
            title={i18n.lessonNumbered({lessonNumber: index + 1, lessonName})}
            levels={levelsByLesson[index]}
          />
        ))}
    </div>
    );
  }
});

export default DetailProgressTable;
