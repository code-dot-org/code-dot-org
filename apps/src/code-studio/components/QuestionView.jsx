import PropTypes from 'prop-types';
import React from 'react';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import {connect} from 'react-redux';
import $ from 'jquery';
import {
  setInstructionsMaxHeightAvailable,
  setInstructionsRenderedHeight
} from '../../redux/instructions';

/**
 * Top-level React wrapper for Question Levels.
 */
class QuestionView extends React.Component {
  static propTypes = {
    setInstructionsMaxHeightAvailable: PropTypes.func,
    setInstructionsRenderedHeight: PropTypes.func
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
      Math.max(windowHeight - 50 - 165 - 75 - 50, 150)
    );

    this.props.setInstructionsRenderedHeight(
      Math.max(windowHeight - 50 - 165 - 75 - 50, 150)
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
      </div>
    );
  }
}

export default connect(
  state => ({}),
  dispatch => ({
    setInstructionsMaxHeightAvailable(height) {
      dispatch(setInstructionsMaxHeightAvailable(height));
    },
    setInstructionsRenderedHeight(height) {
      dispatch(setInstructionsRenderedHeight(height));
    }
  })
)(QuestionView);
