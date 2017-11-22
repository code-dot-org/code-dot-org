import React, {PropTypes} from 'react';
import msg from '@cdo/locale';

import ProtectedStatefulDiv from './ProtectedStatefulDiv';
import commonStyles from '../commonStyles';
import classNames from 'classnames';
import Radium from 'radium';
import SkipButton from './SkipButton';
import { connect } from 'react-redux';

import blankImg from '../../static/common_images/1x1.gif';

const styles = {
  main: {
    // common.scss provides an :after selector that ends up adding 18px of height
    // to gameButtons. We want to get rid of that
    marginBottom: -18
  },
};

export const FinishButton = () => (
  <button id="finishButton" className="share">
    <img src="/blockly/media/1x1.gif" />
    {msg.finish()}
  </button>
);

export const RunButton = Radium(props => (
  <span id="runButtonWrapper">
    <button
      id="runButton"
      className={classNames(['launch', 'blocklyLaunch', props.hidden && 'invisible'])}
      style={props.style}
    >
      <div>
        {props.runButtonText || msg.runProgram()}
      </div>
      <img
        src={blankImg}
        className="run26"
      />
    </button>
  </span>
));
RunButton.propTypes = {
  hidden: PropTypes.bool,
  style: PropTypes.object,
  runButtonText: PropTypes.string,
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
  style: PropTypes.object,
  hideText: PropTypes.bool,
};
ResetButton.displayName = 'ResetButton';

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
export const UnconnectedGameButtons = props => (
  <div>
    <ProtectedStatefulDiv id="gameButtons" style={styles.main}>
      {!props.playspacePhoneFrame &&
        <RunButton
          hidden={props.hideRunButton}
          runButtonText={props.runButtonText}
        />
      }
      {!props.playspacePhoneFrame &&
        <ResetButton />
      }
      {" "/* Explicitly insert whitespace so that this behaves like our ejs file*/}
      {props.children}
    </ProtectedStatefulDiv>
    <div id="gameButtonExtras">
      {props.showSkipButton &&
        <SkipButton nextLevelUrl={props.nextLevelUrl} />
      }
      {props.showFinishButton && <FinishButton />}
    </div>
  </div>
);
UnconnectedGameButtons.propTypes = {
  hideRunButton: PropTypes.bool,
  runButtonText: PropTypes.string,
  playspacePhoneFrame: PropTypes.bool,
  nextLevelUrl: PropTypes.string,
  showSkipButton: PropTypes.bool,
  showFinishButton: PropTypes.bool,
  children: PropTypes.node,
};
UnconnectedGameButtons.displayName = 'GameButtons';

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  runButtonText: state.pageConstants.runButtonText,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
  nextLevelUrl: state.pageConstants.nextLevelUrl,
  showSkipButton: state.pageConstants.isChallengeLevel,
}))(UnconnectedGameButtons);
