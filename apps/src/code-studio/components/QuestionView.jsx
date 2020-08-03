import PropTypes from 'prop-types';
import React from 'react';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';

/**
 * Top-level React wrapper for Question Levels.
 */
export default class QuestionView extends React.Component {
  static propTypes = {
    lastAttempt: PropTypes.string,
    readOnly: PropTypes.bool,
    showUnderageWarning: PropTypes.bool,
    level: PropTypes.shape({
      placeholder: PropTypes.string,
      height: PropTypes.number,
      id: PropTypes.number,
      title: PropTypes.string,
      longInstructions: PropTypes.string,
      allow_user_uploads: PropTypes.bool
    })
  };

  render() {
    return (
      <div>
        <TopInstructions isQuestionLevel={true} />
      </div>
    );
  }
}
