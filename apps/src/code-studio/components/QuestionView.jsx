import PropTypes from 'prop-types';
import React from 'react';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import CompletionButton from '@cdo/apps/templates/CompletionButton';
import {connect} from 'react-redux';

let styles = {
  buttonArea: {
    right: 0,
    position: 'absolute'
  }
};

/**
 * Top-level React wrapper for Question Levels.
 */
class QuestionView extends React.Component {
  static propTypes = {
    instructionsHeight: PropTypes.number
  };

  render() {
    return (
      <div>
        <TopInstructions isQuestionLevel={true} />
        <div
          style={{
            ...styles.buttonArea,
            ...{top: this.props.instructionsHeight}
          }}
        >
          <CompletionButton />
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  instructionsHeight: state.instructions.maxAvailableHeight
}))(QuestionView);
