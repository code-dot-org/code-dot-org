import React, {Component, PropTypes} from 'react';
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
export class FinishButton extends Component {
  render() {
    return (
      <button id="finishButton" className="share">
        <img src="/blockly/media/1x1.gif" />
        {msg.finish()}
      </button>
    );
  }
}

export const RunButton = Radium(class extends Component {
  static propTypes = {
    hidden: PropTypes.bool,
    style: PropTypes.object,
  };
  static displayName = 'RunButton';

  render() {
    return (
      <button
        id="runButton"
        className={classNames(['launch', 'blocklyLaunch', this.props.hidden && 'invisible'])}
        style={this.props.style}
      >
        <div>
          {msg.runProgram()}
        </div>
        <img
          src={blankImg}
          className="run26"
        />
      </button>
    );
  }
});

export const ResetButton = Radium(class extends Component {
  static propTypes = {
    style: PropTypes.object,
    hideText: PropTypes.bool,
  };
  static displayName = 'ResetButton';
  render() {
    return (
      <button
        id="resetButton"
        // See apps/style/common.scss for these class definitions
        className={classNames(["launch", "blocklyLaunch", this.props.hideText && 'hideText'])}
        style={[commonStyles.hidden, this.props.style]}
      >
        <div>
          {!this.props.hideText && msg.resetProgram()}
        </div>
        <img src={blankImg} className="reset26" />
      </button>
    );
  }
});

/**
 * A set of game buttons that consist of a run/reset button, and potentially a
 * set of children that we expect to be additional buttons.
 */
export class UnconnectedGameButtons extends Component {
  static propTypes = {
    hideRunButton: PropTypes.bool,
    playspacePhoneFrame: PropTypes.bool,
    nextLevelUrl: PropTypes.string,
    showSkipButton: PropTypes.bool,
    showFinishButton: PropTypes.bool,
    protectState: PropTypes.bool,
    children: PropTypes.node,
  };
  static defaultProps = {
    protectState: true,
  };
  static displayName = 'GameButtons';

  render() {
    const mainButtons = [
      !this.props.playspacePhoneFrame && <RunButton key="run" hidden={this.props.hideRunButton}/>,
      !this.props.playspacePhoneFrame && <ResetButton key="reset" />,
      " " /* Explicitly insert whitespace so that this behaves like our ejs file*/,
    ];
    if (Array.isArray(this.props.children)) {
      mainButtons.push(...this.props.children);
    } else if (this.props.children) {
      mainButtons.push(this.props.children);
    }
    return (
      <div>
        {this.props.protectState ?
          <ProtectedStatefulDiv id="gameButtons" style={styles.main}>
            {mainButtons}
          </ProtectedStatefulDiv> :
          <div id="gameButtons" style={styles.main}>
            {mainButtons}
          </div>
        }
        <div id="gameButtonExtras">
          {this.props.showSkipButton &&
            <SkipButton nextLevelUrl={this.props.nextLevelUrl} />
          }
          {this.props.showFinishButton && <FinishButton />}
        </div>
      </div>
    );
  }
}

export default connect(state => ({
  hideRunButton: state.pageConstants.hideRunButton,
  playspacePhoneFrame: state.pageConstants.playspacePhoneFrame,
  nextLevelUrl: state.pageConstants.nextLevelUrl,
  showSkipButton: state.pageConstants.isChallengeLevel,
}))(UnconnectedGameButtons);
