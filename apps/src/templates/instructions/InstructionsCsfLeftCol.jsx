import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';
import classNames from 'classnames';
import {connect} from 'react-redux';
import PromptIcon from './PromptIcon';
import HintDisplayLightbulb from '../HintDisplayLightbulb';
import {getOuterHeight} from './utils';
import commonStyles from '../../commonStyles';

var instructions = require('../../redux/instructions');

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon

const styles = {
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default',
    marginBottom: 0
  },
  authoredHints: {
    // raise by 20 so that the lightbulb "floats" without causing the original
    // icon to move. This strangeness happens in part because prompt-icon-cell
    // is managed outside of React
    marginBottom: 0
  }
};

class InstructionsCsfLeftCol extends React.Component {
  static propTypes = {
    requestHint: PropTypes.func.isRequired,
    setColWidth: PropTypes.func.isRequired,
    setColHeight: PropTypes.func.isRequired,
    // from redux
    hasUnseenHint: PropTypes.bool.isRequired,
    hasAuthoredHints: PropTypes.bool.isRequired,
    collapsed: PropTypes.bool.isRequired,
    smallStaticAvatar: PropTypes.string,
    failureAvatar: PropTypes.string,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    })
  };

  componentDidMount() {
    this.updateDimensions();
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  updateDimensions() {
    this.props.setColWidth(this.getColumnWidth());
    this.props.setColHeight(this.getColumnHeight());
  }

  /**
   * Handle a click to the hint display bubble (lightbulb)
   */
  handleClickBubble = () => {
    // If we don't have authored hints to display, clicking bubble shouldnt do anything
    if (this.props.hasAuthoredHints && this.props.hasUnseenHint) {
      this.props.requestHint();
    }
  };

  getAvatar() {
    // Show the "sad" avatar if there is failure feedback. Otherwise,
    // show the default avatar.
    return this.props.feedback && this.props.feedback.isFailure
      ? this.props.failureAvatar
      : this.props.smallStaticAvatar;
  }

  getColumnWidth = () => {
    return (
      (this.getAvatar() ? PROMPT_ICON_WIDTH : 10) +
      (this.props.hasAuthoredHints ? AUTHORED_HINTS_EXTRA_WIDTH : 0)
    );
  };

  getColumnHeight = () => {
    return getOuterHeight(this.leftCol, true);
  };

  render() {
    return (
      <div
        ref={c => {
          this.leftCol = c;
        }}
        style={[
          commonStyles.bubble,
          this.props.hasAuthoredHints
            ? styles.authoredHints
            : styles.noAuthoredHints
        ]}
      >
        <div
          className={classNames({
            'prompt-icon-cell': true,
            authored_hints: this.props.hasAuthoredHints
          })}
          onClick={this.handleClickBubble}
        >
          {this.props.hasAuthoredHints && <HintDisplayLightbulb />}
          {this.getAvatar() && (
            <PromptIcon
              src={this.getAvatar()}
              ref={c => {
                this.icon = c;
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

export default connect(
  function propsFromStore(state) {
    return {
      hasUnseenHint: state.authoredHints.unseenHints.length > 0,
      hasAuthoredHints: state.instructions.hasAuthoredHints,
      collapsed: state.instructions.isCollapsed,
      smallStaticAvatar: state.pageConstants.smallStaticAvatar,
      failureAvatar: state.pageConstants.failureAvatar,
      feedback: state.instructions.feedback
    };
  },
  function propsFromDispatch(dispatch) {
    return {
      hideOverlay: function() {
        dispatch(instructions.hideOverlay());
      },
      setInstructionsRenderedHeight(height) {
        dispatch(instructions.setInstructionsRenderedHeight(height));
      },
      clearFeedback(height) {
        dispatch(instructions.setFeedback(null));
      }
    };
  },
  null,
  {withRef: true}
)(Radium(InstructionsCsfLeftCol));
