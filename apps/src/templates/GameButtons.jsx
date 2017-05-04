import React from 'react';
import msg from '@cdo/locale';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import commonStyles from '../commonStyles';
import classNames from 'classnames';
import Radium from 'radium';
import { connect } from 'react-redux';

import blankImg from '../../static/common_images/1x1.gif';

const styles = {
  main: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that
    marginBottom: 0
  },
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
      className="run26"
    />
  </button>
));
RunButton.propTypes = {
  hidden: React.PropTypes.bool,
  style: React.PropTypes.object,
};
RunButton.displayName = 'RunButton';

export const ResetButton = Radium(props => (
  <button
    id="resetButton"
    // See apps/style/common.scss for these class definitions
    className={classNames(["launch", "blocklyLaunch", props.hideText && 'hideText'])}
    style={[commonStyles.hidden, props.style]}
  >
    <div>
      {!props.hideText && msg.resetProgram()}
    </div>
    <img src={blankImg} className="reset26" />
  </button>
));
ResetButton.propTypes = {
  style: React.PropTypes.object,
  hideText: React.PropTypes.bool,
};
ResetButton.displayName = 'ResetButton';

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
export const UnconnectedGameButtons = props => (
  <ProtectedStatefulDiv
    id="gameButtons"
    style={styles.main}
  >
    {!props.playspacePhoneFrame &&
    <RunButton hidden={props.hideRunButton}/>
    }
    {!props.playspacePhoneFrame &&
    <ResetButton />
    }
    {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
    {props.children}
  </ProtectedStatefulDiv>
);
UnconnectedGameButtons.propTypes = {
  hideRunButton: React.PropTypes.bool,
  playspacePhoneFrame: React.PropTypes.bool,
  children: React.PropTypes.node,
};
UnconnectedGameButtons.displayName = 'GameButtons';

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame
}))(UnconnectedGameButtons);
