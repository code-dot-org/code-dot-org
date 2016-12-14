import React from 'react';
import msg from '@cdo/locale';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import commonStyles from '../commonStyles';
import classNames from 'classnames';
import Radium from 'radium';
import { connect } from 'react-redux';

import backgroundImg from '../../static/common_images/shared-sprites-26x26.png';
import blankImg from '../../static/common_images/1x1.gif';

const styles = {
  main: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that
    marginBottom: -18
  },
  runImage: {
    width: 26,
    height: 26,
    background: `url("${backgroundImg}") 0 0`
  },
  resetImage: {
    width: 26,
    height: 26,
    background: `url("${backgroundImg}") 0 26px`
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
      src={blankImg}
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
      src={blankImg}
      style={[!props.isMinecraft && styles.resetImage, props.imageStyle]}
      className={classNames([props.isMinecraft && "reset26"])}
    />
  </button>
));
ResetButton.propTypes = {
  style: React.PropTypes.object,
  hideText: React.PropTypes.bool,
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
    style={styles.main}
  >
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
  isMinecraft: React.PropTypes.bool,
  playspacePhoneFrame: React.PropTypes.bool,
  children: React.PropTypes.node,
};

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  isMinecraft: state.pageConstants.isMinecraft,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
}))(GameButtons);
