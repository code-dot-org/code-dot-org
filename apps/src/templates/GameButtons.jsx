import React from 'react';
import msg from '../locale';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import commonStyles from '../commonStyles';
import experiments from '../experiments';
import classNames from 'classnames';
import Radium from 'radium';
import { connect } from 'react-redux';

const styles = {
  instructionsInTopPane: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that when we have don't have
    // instructions below game buttons
    marginBottom: -18
  },
  runImage: {
    width: 26,
    height: 26,
    background: 'url("/blockly/media/common_images/shared-sprites-26x26.png") 0 0'
  },
  resetImage: {
    width: 26,
    height: 26,
    background: 'url("/blockly/media/common_images/shared-sprites-26x26.png") 0 26px'
  }
};

export const RunButton = Radium(props => (
  <button
      id="runButton"
      className={classNames(['launch', 'blocklyLaunch', props.hidden && 'invisible'])}
      style={props.style}
  >
    <div>
      {msg.runProgram()}
    </div>
    <img
        src="/blockly/media/1x1.gif"
        style={[!props.isMinecraft && styles.runImage]}
        className={classNames([props.isMinecraft && "run26"])}
    />
  </button>
));
RunButton.propTypes = {
  hidden: React.PropTypes.bool,
  style: React.PropTypes.object,
  // minecraft depends on styles sheets in some cases, instead of inlined
  isMinecraft: React.PropTypes.bool
};

export const ResetButton = Radium(props => (
  <button
      id="resetButton"
      className="launch blocklyLaunch"
      style={[commonStyles.hidden, props.style]}
  >
    <div>
      {!props.hideText && msg.resetProgram()}
    </div>
    <img
        src="/blockly/media/1x1.gif"
        style={[!props.isMinecraft && styles.resetImage, props.imageStyle]}
        className={classNames([props.isMinecraft && "reset26"])}
    />
  </button>
));
ResetButton.propTypes = {
  style: React.PropTypes.object,
  // minecraft depends on styles sheets in some cases, instead of inlined
  isMinecraft: React.PropTypes.bool
};

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
const GameButtons = props => (
  <ProtectedStatefulDiv
      id="gameButtons"
      style={props.instructionsInTopPane ? styles.instructionsInTopPane : undefined}>
    {!props.playspacePhoneFrame &&
    <RunButton
        hidden={props.hideRunButton}
        isMinecraft={props.isMinecraft}
    />
    }
    {!props.playspacePhoneFrame &&
    <ResetButton isMinecraft={props.isMinecraft}/>
    }
    {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
    {props.children}
  </ProtectedStatefulDiv>
);
GameButtons.propTypes = {
  hideRunButton: React.PropTypes.bool,
  instructionsInTopPane: React.PropTypes.bool,
  isMinecraft: React.PropTypes.bool,
  playspacePhoneFrame: React.PropTypes.bool,
  children: React.PropTypes.node,
};

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  instructionsInTopPane: state.pageConstants.instructionsInTopPane,
  isMinecraft: state.pageConstants.isMinecraft,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
}))(GameButtons);


if (BUILD_STYLEGUIDE) {
  RunButton.displayName = 'RunButton';
  ResetButton.displayName = 'ResetButton';
  module.exports.styleGuideExamples = storybook => {
    storybook
      .storiesOf('RunButton', module)
      .addWithInfo(
        'The run button',
        'This button is used for running programs',
        () => <RunButton/>
      );
    storybook
      .storiesOf('ResetButton', module)
      .addWithInfo(
        'The reset button',
        'You have to explicitly set display: block to make this show up. It is hidden by default?!',
        () => <ResetButton style={{display: 'block'}}/>
      );
  };
}
