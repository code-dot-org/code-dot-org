import { Motion, StaggeredMotion, spring } from 'react-motion';
import { connect } from 'react-redux';
import { hideFeedback } from '../redux/feedback';
import { interpolateColors } from '../utils';
import BaseDialog from './BaseDialog';
import GeneratedCode from './feedback/GeneratedCode';
import Odometer from './Odometer';
import PuzzleRatingButtons from  './PuzzleRatingButtons';
import React, { Component, PropTypes } from 'react';
import color from '../util/color';
import msg from '@cdo/locale';

const styles = {
  pageWrapper: {
    position: 'fixed',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    zIndex: 1050,
  },
  modal: {
    width: 375,
    backgroundColor: color.white,
    borderRadius: 10,
  },
  header: {
    backgroundColor: color.light_teal,
    height: 40,
    width: '100%',
    borderRadius: '10px 10px 0px 0px',
  },
  content: {
    padding: '42px 56px 5px',
  },
  bubbleContainer: {
    width: 74,
    height: 74,
    borderRadius: 50,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.light_teal,
    backgroundColor: color.white,
    margin: 'auto',
    position: 'relative',
    top: -30,
    padding: 8,
  },
  bubble: {
    borderWidth: 7,
    borderStyle: 'solid',
    width: 60,
    height: 60,
    borderRadius: '50%',
    transition: 'background-color 250ms linear, border-color 250ms linear',
  },
  buttonContainer: {
    height: 38,
    marginTop: 13,
    display: 'flex',
    justifyContent: 'center',
  },
  blockCountWrapper: {
    textAlign: 'center',
  },
  blockCountLabel: {
    fontSize: 20,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.dark_charcoal,
    verticalAlign: 'middle',
  },
  blockCount: {
    fontSize: 30,
    fontFamily: '"Gotham 7r", sans-serif',
    margin: 7,
    verticalAlign: 'middle',
  },
  blockCountPerfect: {
    color: color.level_perfect,
  },
  blockCountPass: {
    color: color.light_teal,
  },
  blockCountDescriptor: {
    borderRadius: 5,
    borderWidth: 1,
    borderStyle: 'solid',
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    padding: 5,
    verticalAlign: 'middle',
  },
  achievements: {
    width: 217,
    display: 'block',
    margin: '14px 0px 0px',
    padding: '0px 23px',
    borderColor: color.light_teal,
    borderWidth: 1,
    borderStyle: 'solid',
    borderRadius: 5,
    fontFamily: '"Gotham 5r", sans-serif',
    color: color.dark_charcoal,
  },
  achievementIcon: {
    width: 16,
  },
  achievementRow: {
    margin: 4,
  },
  generatedCodeWrapper: {
    padding: '30px 25px 15px 25px',
  },
  generatedCode: {
  },
  funometer: {
    marginTop: 5,
    display: 'flex',
    flexDirection: 'row-reverse',
    minHeight: 32,
  },
  button: {
    borderWidth: 0,
    height: 40,
    color: color.white,
    margin: '0px 5px',
  },
  replayButton: {
    backgroundColor: color.green,
  },
  showCodeButton: {
    backgroundColor: color.teal,
  },
  continueButton: {
    backgroundColor: color.orange,
  },
};

const DEFAULT_STATE = {
  blocksCounted: false,
  blockCountDescriptionShown: false,
  achievementsHighlighted: false,
  showingCode: false,
};

const ANIMATED_STATE = {
  blocksCounted: true,
  blockCountDescriptionShown: true,
  achievementsHighlighted: true,
  showingCode: false,
};

export class UnconnectedFinishDialog extends Component {
  constructor() {
    super();
    this.state = DEFAULT_STATE;
  }

  static propTypes = {
    isOpen: PropTypes.bool,
    hideBackdrop: PropTypes.bool,

    onContinue: PropTypes.func,
    onReplay: PropTypes.func,

    isPerfect: PropTypes.bool,
    blocksUsed: PropTypes.number,
    blockLimit: PropTypes.number,
    achievements: PropTypes.arrayOf(PropTypes.shape({
      isAchieved: PropTypes.bool,
      successIconUrl: PropTypes.string,
      failureIconUrl: PropTypes.string,
      message: PropTypes.string,
    })),
    showFunometer: PropTypes.bool,
    canShare: PropTypes.bool,
    studentCode: PropTypes.shape({
      message: PropTypes.string,
      code: PropTypes.string,
    }),
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      // Reset state when closing the dialog
      this.setState(DEFAULT_STATE);
    }
    if ((this.props.blockLimit === undefined ||
        this.props.blockLimit === Infinity) &&
       (!this.state.blocksCounted || !this.state.blockCountDescriptionShown)) {
      this.setState({
        blocksCounted: true,
        blockCountDescriptionShown: true,
      });
    }
  }

  getBubble() {
    let backgroundColor = color.white;
    let borderColor = color.light_gray;
    if (this.state.blocksCounted) {
      borderColor = color.level_perfect;
      if (this.props.isPerfect) {
        backgroundColor = color.level_perfect;
      } else {
        backgroundColor = color.level_passed;
      }
    }
    return (
      <div style={styles.bubbleContainer}>
        <div
          className="uitest-bubble"
          style={{
            ...styles.bubble,
            backgroundColor,
            borderColor,
          }}
        />
      </div>
    );
  }

  getBlockCountDescription() {
    let description;
    if (this.props.blocksUsed < this.props.blockLimit) {
      description = msg.betterThanPerfectDescription();
    } else if (this.props.blocksUsed === this.props.blockLimit) {
      description = msg.perfectDescription();
    } else {
      description = msg.tooManyBlocksDescription();
    }

    return (
      <Motion
        defaultStyle={{scale: this.state.blockCountDescriptionShown ? 1 : 0}}
        style={{scale: spring(this.state.blocksCounted ? 1 : 0, {stiffness: 250, damping: 18})}}
        onRest={() => this.setState({blockCountDescriptionShown: true})}
      >
        {interpolatingStyle => {
          const { scale } = interpolatingStyle;
          const transform = `translateY(${50 * (1 - scale)}%) scaleY(${scale})`;
          return (
            <span
              style={{
                ...styles.blockCountDescriptor,
                transform,
              }}
            >
              {description}
            </span>
          );
        }}
      </Motion>
    );
  }

  getBlockCounter() {
    if (this.props.blockLimit === undefined ||
        this.props.blockLimit === Infinity) {
      return null;
    }

    const tooManyBlocks = this.props.blocksUsed > this.props.blockLimit;
    return (
      <div style={styles.blockCountWrapper}>
        <span style={styles.blockCountLabel}>
          {msg.numBlocksUsedLabel()}:
        </span>
        <span
          style={tooManyBlocks ?
            styles.blockCountPass : styles.blockCountPerfect}
        >
          <span style={styles.blockCount}>
            <Odometer
              defaultValue={this.state.blocksCounted ? this.props.blocksUsed : 0}
              value={this.props.blocksUsed}
              onRest={() => this.setState({blocksCounted: true})}
            />
            {this.props.blockLimit && ('/' + this.props.blockLimit.toString())}
          </span>
          {this.getBlockCountDescription()}
        </span>
      </div>
    );
  }

  getAchievements() {
    if (!this.props.achievements || this.props.achievements.length === 0) {
      return null;
    }

    const defaultStyles = this.props.achievements.map(() => ({
      color: this.state.achievementsHightlighted ? 1 : 0,
    }));
    const stylesGenerator = prevIterpolatedStyles => prevIterpolatedStyles.map((_, i) => {
      const highlighted = this.props.achievements[i].isAchieved &&
        this.state.blockCountDescriptionShown;
      let target;
      if (!highlighted) {
        target = 0;
      } else if (i === 0) {
        target = 1;
      } else {
        target = prevIterpolatedStyles[i - 1].color;
      }
      return {
        color: this.state.achievementsHighlighted ? target: spring(target),
      };
    });

    return (
      <StaggeredMotion
        defaultStyles={defaultStyles}
        styles={stylesGenerator}
      >
        {interpolatingStyles =>
          <div style={styles.achievements}>
            {interpolatingStyles.map((style, index) => {
              const achievement = this.props.achievements[index];
              return (
                <div
                  style={{
                    ...styles.achievementRow,
                    color: interpolateColors(
                      color.lighter_gray,
                      color.dark_charcoal,
                      style.color
                    ),
                  }}
                  key={index}
                >
                  <img
                    src={style.color > 0 ?
                      achievement.successIconUrl :
                      achievement.failureIconUrl}
                    style={styles.achievementIcon}
                  />
                  {achievement.message}
                </div>
              );
            })}
          </div>
        }
      </StaggeredMotion>
    );
  }

  getFunometer() {
    return (
      <div style={styles.funometer}>
        {this.props.showFunometer &&
          <PuzzleRatingButtons
            useLegacyStyles
            label={msg.rateButtonsLabel()}
          />
        }
      </div>
    );
  }

  getButtons() {
    const showCode = !this.state.showingCode ?
      <button
        key="showcode"
        style={{...styles.button, ...styles.showCodeButton}}
        onClick={() => this.setState({
          ...ANIMATED_STATE,
          showingCode: true,
        })}
      >
        {msg.showGeneratedCode()}
      </button> :
      <button
        key="hidecode"
        style={{...styles.button, ...styles.showCodeButton}}
        onClick={() => this.setState({
          ...ANIMATED_STATE,
          showingCode: false,
        })}
      >
        {msg.hideGeneratedCode()}
      </button>;

    return [
      <button
        key="replay"
        style={{...styles.button, ...styles.replayButton}}
        onClick={this.props.onReplay}
      >
        Replay
      </button>,
      showCode,
      <button
        key="continue"
        style={{...styles.button, ...styles.continueButton}}
        onClick={this.props.onContinue}
      >
        Continue
      </button>,
    ];
  }

  render() {
    if (!this.props.isOpen && !this.props.hideBackdrop) {
      return null;
    }

    return (
      <BaseDialog
        isOpen={this.props.isOpen}
        hideBackdrop={this.props.hideBackdrop}
        handleClose={this.props.onContinue}
        hideCloseButton
        noModalStyles
      >
        <div style={this.props.hideBackdrop ? {} : styles.pageWrapper}>
          <div style={styles.modalWrapper}>
            <div
              style={styles.modal}
            >
              <div style={styles.header}>
                {this.getBubble()}
              </div>
              {this.state.showingCode ?
                <div style={styles.generatedCodeWrapper}>
                  <GeneratedCode
                    message={this.props.studentCode.message}
                    code={this.props.studentCode.code}
                    style={styles.generatedCode}
                  />
                </div> :
                <div style={styles.content}>
                  {this.getBlockCounter()}
                  {this.getAchievements()}
                  {this.getFunometer()}
                </div>}
            </div>
            <div style={styles.buttonContainer}>
              {this.getButtons()}
            </div>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

export default connect(state => ({
  isOpen: state.feedback.displayingFeedback,
  isPerfect:  state.feedback.isPerfect,
  blocksUsed: state.feedback.blocksUsed,
  blockLimit: state.feedback.blockLimit,
  achievements: state.feedback.achievements,
  showFunometer: state.feedback.displayFunometer,
  canShare: state.feedback.canShare,
  studentCode: state.feedback.studentCode,
}), dispatch => ({
  onReplay: () => dispatch(hideFeedback()),
}))(UnconnectedFinishDialog);
