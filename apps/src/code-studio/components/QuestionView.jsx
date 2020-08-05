import PropTypes from 'prop-types';
import React from 'react';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import CompletionButton from '@cdo/apps/templates/CompletionButton';
import {connect} from 'react-redux';
import $ from 'jquery';
import {setInstructionsMaxHeightAvailable} from '../../redux/instructions';

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
    instructionsHeight: PropTypes.number,
    setInstructionsMaxHeightAvailable: PropTypes.func
  };

  // only used so that we can rerender when resized
  state = {
    windowHeight: undefined
  };

  /**
   * Called when the window resizes. Look to see if height changed.
   */
  onResize = () => {
    const {windowHeight: lastWindowHeight} = this.state;
    const windowHeight = $(window).height();

    // If height didn't change, we don't need to do anything else here
    if (windowHeight === lastWindowHeight) {
      return;
    }

    this.setState({windowHeight});

    this.props.setInstructionsMaxHeightAvailable(
      Math.max(windowHeight - 50 - 165 - 125 - 50, 150)
    );
  };

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

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

export default connect(
  state => ({
    instructionsHeight: state.instructions.maxAvailableHeight
  }),
  dispatch => ({
    setInstructionsMaxHeightAvailable(height) {
      dispatch(setInstructionsMaxHeightAvailable(height));
    }
  })
)(QuestionView);
