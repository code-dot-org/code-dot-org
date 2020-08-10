import PropTypes from 'prop-types';
import React from 'react';
import TopInstructions from '@cdo/apps/templates/instructions/TopInstructions';
import {connect} from 'react-redux';
import $ from 'jquery';
import {
  setInstructionsMaxHeightAvailable,
  setInstructionsRenderedHeight
} from '../../redux/instructions';
import FreeResponse from '@cdo/apps/code-studio/components/FreeResponse';

var styles = {
  /*
  This matches to the left value provided in top instructions so that
  the spacing of the question area and the instructions area match up.
  There might be a better way to do this.
   */
  questionArea: {
    width: 2 * ($(window).width() / 6)
  }
};

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

    /*
    The numbers (50 - 165 - 70) are the size of the Header, Footer and then
    so extra padding to make sure the size of the instructions fits inside
    the level area. I could not find global constants to use for those but
    if you can that would be great. The 150 was just a min height.

    In general I'm not sure if this resizing should be owned here but that was
    how I was able to make it work. The TopInstructions component is in real need
    of clean up and the height resizing on it is already overly complicated.
     */

    this.props.setInstructionsMaxHeightAvailable(
      Math.max(windowHeight - 50 - 165 - 70, 150)
    );

    this.props.setInstructionsRenderedHeight(
      Math.max(windowHeight - 50 - 165 - 70, 150)
    );
  };

  componentDidMount() {
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  /*
  TODO: Instead of having the FreeResponse component here we should probably try
  to mirror what we do with WebLabView/AppLabView components and have a "QuestionVisualizationArea"
  component where we decide what type of question the level is and then decide which component
  such as FreeResponse to render

  TODO: It would be better if isQuestionLevel was part of instructions redux
   */

  render() {
    return (
      <div>
        <div style={styles.questionArea}>
          <FreeResponse />
        </div>
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
