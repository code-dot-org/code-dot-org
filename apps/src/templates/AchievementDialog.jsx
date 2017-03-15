import { Motion, StaggeredMotion, spring } from 'react-motion';
import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';

const ANIMATION_OVERLAP = 0.2;
const MIN_PROGRESS_WIDTH = 22;
const MAX_PROGRESS_WIDTH = 400;

const styles = {
  checkmarks: {
    position: 'absolute',
    top: 50,
    right: 120,
    left: 120,
    height: 230,
    padding: '50px 30px 50px 80px',
    boxSizing: 'border-box',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 7px 2px rgba(0, 0, 0, 0.3)',
    color: color.purple,
  },
  achievement: {
    row: {
      marginBottom: 25,
    },
    icon: {
      position: 'relative',
      fontSize: 30,
      width: 30,
    },
    text: {
      fontSize: 20,
      color: '#392e52',
      marginLeft: 40,
    },
    inactive: {
      color: '#aaa',
    }
  },
  absolute: {
    position: 'absolute'
  },
  feedbackMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4e5665',
    width: 450,
    lineHeight: 1.3,
    margin: '20px auto',
  },
  footer: {
    position: 'absolute',
    bottom: 10,
    right: 20,
    left: 20,
  },
  buttonPrimary: {
    float: 'right',
    background: color.orange,
    color: color.white,
    border: '1px solid #b07202',
    borderRadius: 3,
    boxShadow: 'inset 0 1px 0 0 rgba(255, 255, 255, 0.63)',
    fontSize: 14,
    padding: '8px 20px',
  },
  buttonSecondary: {
    background: '#eee',
    color: '#5b6770',
    border: '1px solid #c5c5c5',
  },
  stageRewards: {
    position: 'absolute',
    background: '#f3eeff',
    top: 240,
    left: 100,
    width: '500px',
    height: '75px',
    border: '1px solid #d2cae6',
    borderRadius: 3,
  },
  stageRewardsTitle: {
    textAlign: 'center',
    color: '#655689',
    fontSize: 14,
    fontWeight: 'bold',
    padding: 10,
  },
  progressBackground: {
    position: 'absolute',
    background: '#fff',
    borderRadius: 10,
    border: '1px solid #d2cae6',
    height: 20,
    width: MAX_PROGRESS_WIDTH,
    left: 50,
  },
  progressForeground: {
    position: 'absolute',
    background: '#eaa721',
    borderRadius: 11,
    height: 22,
    top: -1,
    left: -1,
  },
};

const AchievementDialog = Radium(React.createClass({
  propTypes: {
    puzzleNumber: React.PropTypes.number,
    idealBlocks: React.PropTypes.number,
    actualBlocks: React.PropTypes.number,
    hintsUsed: React.PropTypes.number,
    assetUrl: React.PropTypes.func,
    onContinue: React.PropTypes.func,
    showStageProgress: React.PropTypes.bool,
    oldStageProgress: React.PropTypes.number,
    newPassedProgress: React.PropTypes.number,
    newPerfectProgress: React.PropTypes.number,
    newHintUsageProgress: React.PropTypes.number,
  },

  getInitialState() {
    return {isOpen: true};
  },

  handleClose(nextPuzzle = true) {
    this.setState({isOpen: false});
    nextPuzzle && this.props.onContinue();
  },

  icon(flag) {
    return (
      <span
        style={[
          styles.achievement.icon,
          !flag && styles.achievement.inactive
        ]}
      >
        {flag ?
          <i className="fa fa-check-square-o" style={styles.absolute}/> :
          [
            <i
              key="a"
              className="fa fa-square-o"
              style={styles.absolute}
            />,
            <i
              key="b"
              className="fa fa-times"
              style={[styles.absolute, {fontSize: 24, left: 2, top: 10}]}
            />
          ]
        }
      </span>
    );
  },

  achievementRow(flag, message, style) {
    return (
      <p style={{...styles.achievement.row, ...style}}>
        {this.icon(flag)}
        <span style={styles.achievement.text}>{message}</span>
      </p>
    );
  },

  blocksUsedMessage(blockDelta, params) {
    if (blockDelta > 0) {
      return locale.usingTooManyBlocks(params);
    } else if (blockDelta === 0) {
      return locale.exactNumberOfBlocks(params);
    } else {
      return locale.fewerNumberOfBlocks(params);
    }
  },

  hintsMessage(tooManyHints) {
    return tooManyHints ? locale.usingHints() : locale.withoutHints();
  },

  progressToBarWidth(progress) {
    return MIN_PROGRESS_WIDTH +
      progress * (MAX_PROGRESS_WIDTH - MIN_PROGRESS_WIDTH);
  },

  render() {
    const showNumBlocksRow = isFinite(this.props.idealBlocks);
    const blockDelta = this.props.actualBlocks - this.props.idealBlocks;
    const tooManyBlocks = blockDelta > 0;
    const tooManyHints = this.props.hintsUsed > 0;

    const params = {
      puzzleNumber: this.props.puzzleNumber,
      numBlocks: this.props.idealBlocks,
    };
    const feedbackMessage = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevel'](params);

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose.bind(this, !tooManyBlocks)}
        assetUrl={this.props.assetUrl}
      >
        <StaggeredMotion
          defaultStyles={Array(4).fill({ progress: 0 })}
          styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
            return i === 0 ?
              { progress: spring(1, { stiffness: 50, damping: 25 }) } :
              { progress: spring(
                  prevInterpolatedStyles[i - 1].progress > (1 - ANIMATION_OVERLAP) ? 1 : 0,
                  { stiffness: 30, damping: 25 }),
              };
          })}
        >
          {interpolatingValues => {
              const interpolatingStyles =
                interpolatingValues.map(val => ({ opacity: val.progress }));
              return (<div>
                <div style={styles.checkmarks}>
                  {this.achievementRow(
                      true,
                      locale.puzzleCompleted(),
                      interpolatingStyles[1])}
                  {showNumBlocksRow && this.achievementRow(
                      !tooManyBlocks,
                      this.blocksUsedMessage(blockDelta, params),
                      interpolatingStyles[2])}
                  {this.achievementRow(
                      !tooManyHints,
                      this.hintsMessage(tooManyHints),
                      interpolatingStyles[showNumBlocksRow ? 3 : 2])}
                </div>
                {this.props.showStageProgress &&
                  <div style={styles.stageRewards}>
                    <div style={styles.stageRewardsTitle}>
                      {locale.stageRewards()}
                    </div>
                    <div style={styles.progressBackground}>
                      <Motion
                        defaultStyle={{
                          width: this.progressToBarWidth(this.props.oldStageProgress)
                        }}
                        style={{
                          width: spring(this.progressToBarWidth(
                              this.props.oldStageProgress +
                              (interpolatingValues[1].progress > 0 ? this.props.newPassedProgress : 0) +
                              (interpolatingValues[2].progress > 0 ? this.props.newPerfectProgress : 0) +
                              (interpolatingValues[showNumBlocksRow ? 3 : 2].progress > 0 ?
                                this.props.newHintUsageProgress : 0)),
                            { stiffness: 70, damping: 25 })
                        }}
                      >
                        {interpolatingStyle =>
                          <div
                            style={{
                              ...styles.progressForeground,
                              ...interpolatingStyle,
                            }}
                          />}
                      </Motion>
                    </div>
                  </div>
                }
              </div>);
            }
          }
        </StaggeredMotion>
        <div style={styles.footer}>
          <p style={styles.feedbackMessage}>{feedbackMessage}</p>

          <button
            onClick={this.handleClose}
            style={[
              styles.buttonPrimary,
              tooManyBlocks && styles.buttonSecondary
            ]}
          >
            {locale.continue()}
          </button>
          {tooManyBlocks &&
            <button
              onClick={this.handleClose.bind(this, false)}
              style={styles.buttonPrimary}
            >
              {locale.tryAgain()}
            </button>
          }
        </div>
      </BaseDialog>
    );
  }
}));

export default AchievementDialog;
