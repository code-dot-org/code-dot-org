import React, { PropTypes } from 'react';
import ProgressStage from './ProgressStage';
import i18n from '@cdo/locale';

/**
 * A component that shows progress in a course with more detail than the summary
 * view
 */
const DetailProgressTable = React.createClass({
  propTypes: {
    lessonNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    levelsByStage: PropTypes.arrayOf(
      PropTypes.arrayOf(
        PropTypes.shape({
          status: PropTypes.string.isRequired,
          url: PropTypes.string.isRequired
        })
      )
    ).isRequired,
  },

  render() {
    const { lessonNames, levelsByStage } = this.props;
    return (
      <div>
        {lessonNames.map((lessonName, index) => (
          <ProgressStage
            key={index}
            title={i18n.lessonN({lessonNumber: index + 1}) + ": " + lessonName}
            levels={levelsByStage[index]}
          />
        ))}
    </div>
    );
  }
});

export default DetailProgressTable;
