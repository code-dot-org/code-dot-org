import {Motion, StaggeredMotion, spring} from 'react-motion';
import {connect} from 'react-redux';
import {hideFeedback} from '../redux/feedback';
import {interpolateColors} from '../utils';
import BaseDialog from './BaseDialog';
import GeneratedCode from './feedback/GeneratedCode';
import Odometer from './Odometer';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import Confetti from 'react-dom-confetti';
import LessonProgress from '@cdo/apps/code-studio/components/progress/LessonProgress';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import color from '../util/color';
import msg from '@cdo/locale';
import {shareProject} from '@cdo/apps/code-studio/headerShare';

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
    zIndex: 1040
  },
  modal: {
    position: 'relative',
    width: 450,
    backgroundColor: color.white,
    borderRadius: 10
  },
  header: {
    backgroundColor: color.light_teal,
    height: 50,
    width: '100%',
    borderRadius: '10px 10px 0px 0px'
  },
  content: {
    padding: '8px 0 5px',
    textAlign: 'center'
  },
  confetti: {
    position: 'relative',
    left: '50%',
    top: 150
  },
  bubbleContainer: {
    width: 74,
    height: 74,
    borderRadius: 50,
    borderWidth: 5,
    borderStyle: 'solid',
    borderColor: color.light_teal,
    backgroundColor: color.white,
    position: 'absolute',
    top: -25,
    left: -20,
    padding: 8
  },
  bubble: {
    borderWidth: 7,
    borderStyle: 'solid',
    width: 60,
    height: 60,
    borderRadius: '50%',
    transition: 'background-color 250ms linear, border-color 250ms linear'
  },
  buttonContainer: {
    height: 38,
    marginTop: 13,
    display: 'flex',
    justifyContent: 'center'
  },
  blockCountWrapper: {
    color: color.white,
    textAlign: 'right',
    marginRight: 10
  },
  blockCountLabel: {
    fontSize: 20,
    fontFamily: '"Gotham 5r", sans-serif',
    verticalAlign: 'middle'
  },
  blockCount: {
    fontSize: 30,
    fontFamily: '"Gotham 5r", sans-serif',
    margin: 7,
    verticalAlign: 'middle'
  },
  blockCountPerfect: {
    color: color.level_perfect
  },
  blockCountPass: {
    color: color.light_teal
  },
  blockCountDescriptor: {
    borderRadius: 5,
    display: 'inline-block',
    fontFamily: '"Gotham 5r", sans-serif',
    padding: 5,
    verticalAlign: 'middle',
    background: color.white
  },
  mastery: {
    display: 'inline-block'
  },
  share: {
    float: 'left',
    width: 180,
    height: 200,
    paddingTop: 20
  },
  thumbnail: {
    width: 150,
    height: 150,
    backgroundSize: 'cover',
    marginLeft: 15,
    border: '1px solid'
  },
  shareButton: {
    background: color.cyan,
    color: color.white
  },
  achievementWrapper: {
    marginLeft: 20,
    marginRight: 20
  },
  achievementsHeading: {
    margin: '20px auto 0',
    color: color.light_gray,
    fontFamily: '"Gotham 5r", sans-serif',
    fontSize: 16
  },
  achievements: {
    display: 'block',
    margin: '4px auto 4px',
    borderColor: color.lighter_gray,
    borderWidth: '1px 0',
    borderStyle: 'solid',
    fontFamily: '"Gotham 4r", sans-serif',
    fontSize: 14,
    color: color.dark_charcoal,
    overflow: 'hidden'
  },
  achievementIcon: {
    color: color.teal,
    marginRight: 6,
    fontSize: 32,
    verticalAlign: 'middle'
  },
  achievementText: {
    verticalAlign: 'middle'
  },
  achievementRow: {
    padding: 10,
    boxSizing: 'border-box',
    textAlign: 'left'
  },
  achievementRowNonShare: {
    width: '50%',
    float: 'left'
  },
  generatedCodeWrapper: {
    padding: '30px 25px 15px 25px'
  },
  generatedCode: {},
  funometer: {
    marginTop: 5,
    marginLeft: 20,
    display: 'flex',
    minHeight: 32
  },
  button: {
    borderWidth: 0,
    height: 40,
    color: color.white,
    margin: '0px 5px'
  },
  replayButton: {
    backgroundColor: color.green
  },
  showCodeButton: {
    backgroundColor: color.teal
  },
  continueButton: {
    backgroundColor: color.orange
  }
};

const DEFAULT_STATE = {
  blocksCounted: false,
  blockCountDescriptionShown: false,
  achievementsHighlighted: false,
  showingCode: false
};

const ANIMATED_STATE = {
  blocksCounted: true,
  blockCountDescriptionShown: true,
  achievementsHighlighted: true,
  showingCode: false
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

    isChallenge: PropTypes.bool,
    isPerfect: PropTypes.bool,
    blocksUsed: PropTypes.number,
    blockLimit: PropTypes.number,
    achievements: PropTypes.arrayOf(
      PropTypes.shape({
        isAchieved: PropTypes.bool,
        successIconUrl: PropTypes.string,
        failureIconUrl: PropTypes.string,
        message: PropTypes.string
      })
    ),
    showFunometer: PropTypes.bool,
    getShareUrl: PropTypes.func,
    studentCode: PropTypes.shape({
      message: PropTypes.string,
      code: PropTypes.string
    }),
    feedbackImage: PropTypes.string
  };

  componentWillReceiveProps(nextProps) {
    if (this.props.isOpen && !nextProps.isOpen) {
      // Reset state when closing the dialog
      this.setState(DEFAULT_STATE);
    }
    if (
      (this.props.blockLimit === undefined ||
        this.props.blockLimit === Infinity) &&
      (!this.state.blocksCounted || !this.state.blockCountDescriptionShown)
    ) {
      this.setState({
        blocksCounted: true,
        blockCountDescriptionShown: true
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
            borderColor
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
        style={{
          scale: spring(this.state.blocksCounted ? 1 : 0, {
            stiffness: 250,
            damping: 18
          })
        }}
        onRest={() => this.setState({blockCountDescriptionShown: true})}
      >
        {interpolatingStyle => {
          const {scale} = interpolatingStyle;
          const transform = `translateY(${50 * (1 - scale)}%) scaleY(${scale})`;
          return (
            <span
              style={{
                ...styles.blockCountDescriptor,
                transform
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
    if (
      this.props.blockLimit === undefined ||
      this.props.blockLimit === Infinity
    ) {
      return null;
    }

    const tooManyBlocks = this.props.blocksUsed > this.props.blockLimit;
    return (
      <div style={styles.blockCountWrapper}>
        <span style={styles.blockCountLabel}>{msg.numBlocksUsedLabel()}:</span>
        <span style={styles.blockCount}>
          <Odometer
            defaultValue={this.state.blocksCounted ? this.props.blocksUsed : 0}
            value={this.props.blocksUsed}
            onRest={() => this.setState({blocksCounted: true})}
          />
          {this.props.blockLimit && '/' + this.props.blockLimit.toString()}
        </span>
        <span
          style={
            tooManyBlocks ? styles.blockCountPass : styles.blockCountPerfect
          }
        >
          {this.getBlockCountDescription()}
        </span>
      </div>
    );
  }

  getAchievements() {
    const defaultStyles = this.props.achievements.map(() => ({
      color: this.state.achievementsHightlighted ? 1 : 0
    }));
    const stylesGenerator = prevIterpolatedStyles =>
      prevIterpolatedStyles.map((_, i) => {
        const highlighted =
          this.props.achievements[i].isAchieved &&
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
          color: this.state.achievementsHighlighted ? target : spring(target)
        };
      });

    return (
      <StaggeredMotion defaultStyles={defaultStyles} styles={stylesGenerator}>
        {interpolatingStyles => (
          <div style={styles.achievements}>
            {interpolatingStyles.map((style, index) => {
              const achievement = this.props.achievements[index];
              return (
                <div
                  style={{
                    ...styles.achievementRow,
                    ...(!this.props.feedbackImage &&
                      styles.achievementRowNonShare),
                    color: interpolateColors(
                      color.lighter_gray,
                      color.dark_charcoal,
                      style.color
                    )
                  }}
                  key={index}
                >
                  <FontAwesome
                    icon="check-circle-o"
                    style={styles.achievementIcon}
                  />
                  <span style={styles.achievementText}>
                    {achievement.message}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </StaggeredMotion>
    );
  }

  getFunometer() {
    return (
      <div style={styles.funometer}>
        {this.props.showFunometer && (
          <PuzzleRatingButtons useLegacyStyles label={msg.rateButtonsLabel()} />
        )}
      </div>
    );
  }

  getButtons() {
    const showCode = !this.state.showingCode ? (
      <button
        type="button"
        key="showcode"
        style={{...styles.button, ...styles.showCodeButton}}
        onClick={() =>
          this.setState({
            ...ANIMATED_STATE,
            showingCode: true
          })
        }
      >
        {msg.showGeneratedCode()}
      </button>
    ) : (
      <button
        type="button"
        key="hidecode"
        style={{...styles.button, ...styles.showCodeButton}}
        onClick={() =>
          this.setState({
            ...ANIMATED_STATE,
            showingCode: false
          })
        }
      >
        {msg.hideGeneratedCode()}
      </button>
    );

    return [
      <button
        type="button"
        key="replay"
        style={{...styles.button, ...styles.replayButton}}
        onClick={this.props.onReplay}
      >
        Replay
      </button>,
      showCode,
      <button
        type="button"
        key="continue"
        style={{...styles.button, ...styles.continueButton}}
        onClick={this.props.onContinue}
      >
        Continue
      </button>
    ];
  }

  render() {
    if (!this.props.isOpen && !this.props.hideBackdrop) {
      return null;
    }

    const confetti =
      this.props.isChallenge &&
      this.props.isPerfect &&
      this.state.blocksCounted;
    const showAchievements =
      this.props.achievements && this.props.achievements.length !== 0;

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
            <div style={styles.modal}>
              <div style={styles.confetti}>
                <Confetti active={confetti} />
              </div>
              <div style={styles.header}>
                {this.getBubble()}
                {this.getBlockCounter()}
              </div>
              {this.state.showingCode ? (
                <div style={styles.generatedCodeWrapper}>
                  <GeneratedCode
                    message={this.props.studentCode.message}
                    code={this.props.studentCode.code}
                    style={styles.generatedCode}
                  />
                </div>
              ) : (
                <div
                  style={{
                    ...styles.content,
                    ...(this.props.feedbackImage && {minHeight: 277})
                  }}
                >
                  <div style={styles.mastery}>
                    <LessonProgress lessonTrophyEnabled />
                  </div>
                  {this.props.feedbackImage && (
                    <div style={styles.share}>
                      <div
                        style={{
                          ...styles.thumbnail,
                          backgroundImage: `url(${this.props.feedbackImage})`
                        }}
                      />
                      <button
                        type="button"
                        style={styles.shareButton}
                        onClick={() => shareProject(this.props.getShareUrl())}
                      >
                        {msg.share()}
                      </button>
                    </div>
                  )}
                  {showAchievements && (
                    <div
                      style={{
                        ...styles.achievementWrapper,
                        ...(this.props.feedbackImage && {marginLeft: 180})
                      }}
                    >
                      <div style={styles.achievementsHeading}>
                        {msg.achievements()}
                      </div>
                      {this.getAchievements()}
                    </div>
                  )}
                  {this.getFunometer()}
                </div>
              )}
            </div>
            <div style={styles.buttonContainer}>{this.getButtons()}</div>
          </div>
        </div>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isOpen: state.feedback.displayingFeedback,
    isChallenge: state.feedback.isChallenge,
    isPerfect: state.feedback.isPerfect,
    blocksUsed: state.feedback.blocksUsed,
    blockLimit: state.feedback.blockLimit,
    achievements: state.feedback.achievements,
    showFunometer: state.feedback.displayFunometer,
    studentCode: state.feedback.studentCode,
    feedbackImage: state.feedback.feedbackImage
  }),
  dispatch => ({
    onReplay: () => dispatch(hideFeedback())
  })
)(UnconnectedFinishDialog);
