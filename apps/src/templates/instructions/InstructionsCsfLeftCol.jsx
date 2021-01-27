import $ from 'jquery';
import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import Radium from 'radium';
import classNames from 'classnames';
import {connect} from 'react-redux';
import PromptIcon from './PromptIcon';
import HintDisplayLightbulb from '../HintDisplayLightbulb';
import {getOuterHeight} from './utils';
import commonStyles from '../../commonStyles';

const PROMPT_ICON_WIDTH = 60; // 50 + 10 for padding
const AUTHORED_HINTS_EXTRA_WIDTH = 30; // 40 px, but 10 overlap with prompt icon

class InstructionsCsfLeftCol extends React.Component {
  static propTypes = {
    requestHint: PropTypes.func.isRequired,
    setColWidth: PropTypes.func.isRequired,
    setColHeight: PropTypes.func.isRequired,
    // from redux
    hasUnseenHint: PropTypes.bool.isRequired,
    hasAuthoredHints: PropTypes.bool.isRequired,
    smallStaticAvatar: PropTypes.string,
    failureAvatar: PropTypes.string,
    feedback: PropTypes.shape({
      message: PropTypes.string.isRequired,
      isFailure: PropTypes.bool
    })
  };

  componentDidMount() {
    this.updateDimensions();

    // Might want to increase the size of our instructions after our icon image
    // has loaded, to make sure the image fits
    $(ReactDOM.findDOMNode(this.icon)).load(() => {
      this.updateDimensions();
    });
  }

  componentDidUpdate() {
    this.updateDimensions();
  }

  updateDimensions() {
    this.props.setColWidth(this.getColumnWidth());
    this.props.setColHeight(this.getColumnHeight());
  }

  /**
   * Handle a click to the hint display lightbulb
   */
  handleClickLightbulb = () => {
    // If we don't have authored hints to display, clicking lightbulb shouldnt do anything
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
    const {hasAuthoredHints} = this.props;

    return (
      <div
        ref={c => {
          this.leftCol = c;
        }}
        style={[
          commonStyles.bubble,
          !hasAuthoredHints && styles.noAuthoredHints
        ]}
      >
        <div
          className={classNames('prompt-icon-cell', {
            authored_hints: hasAuthoredHints
          })}
          onClick={this.handleClickLightbulb}
        >
          {hasAuthoredHints && <HintDisplayLightbulb />}
          {this.getAvatar() && (
            <PromptIcon
              src={this.getAvatar()}
              ref={icon => {
                this.icon = icon;
              }}
            />
          )}
        </div>
      </div>
    );
  }
}

const styles = {
  // bubble has pointer cursor by default. override that if no hints
  noAuthoredHints: {
    cursor: 'default'
  }
};

export const UnconnectedInstructionsCsfLeftCol = Radium(InstructionsCsfLeftCol);

export default connect(
  function propsFromStore(state) {
    return {
      hasUnseenHint: state.authoredHints.unseenHints.length > 0,
      hasAuthoredHints: state.instructions.hasAuthoredHints,
      smallStaticAvatar: state.pageConstants.smallStaticAvatar,
      failureAvatar: state.pageConstants.failureAvatar,
      feedback: state.instructions.feedback
    };
  },
  null,
  null,
  {forwardRef: true}
)(Radium(InstructionsCsfLeftCol));
