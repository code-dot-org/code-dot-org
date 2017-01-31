import React, { PropTypes } from 'react';
import ProgressStage from './ProgressStage';

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
    // TODO - better i18n for string construction
    return (
      <div>
        {lessonNames.map((lessonName, index) => (
          <ProgressStage
            key={index}
            title={`Stage ${index + 1}: ${lessonName}`}
            levels={levelsByStage[index]}
          />
        ))}
    </div>
    );
  }
});

export default DetailProgressTable;
