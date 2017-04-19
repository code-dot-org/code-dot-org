import { StaggeredMotion, spring } from 'react-motion';
import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import StageProgressBar from './StageProgressBar';

const ANIMATION_OVERLAP = 0.05;

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
    showPuzzleRatingButtons: React.PropTypes.bool,
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

  achievementRowGenerator(show, successful, message) {
    if (!show) {
      return null;
    }

    return (style, index) => {
      return (
        <p style={{...styles.achievement.row, ...style}} key={index}>
          {this.icon(successful)}
          <span style={styles.achievement.text}>{message}</span>
        </p>
      );
    };
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

  hintsMessage(numHints) {
    if (numHints === 0) {
      return locale.withoutHints();
    } else if (numHints === 1) {
      return locale.usingOneHint();
    } else {
      return locale.usingHints();
    }
  },

  render() {
    const showNumBlocksRow = isFinite(this.props.idealBlocks);
    const blockDelta = this.props.actualBlocks - this.props.idealBlocks;
    const tooManyBlocks = blockDelta > 0;
    const tooManyHints = this.props.hintsUsed > 1;
    const params = {
      puzzleNumber: this.props.puzzleNumber,
      numBlocks: this.props.idealBlocks,
    };
    const feedbackMessage = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevel'](params);

    const achievementRowGenerators = [
      this.achievementRowGenerator(true /* show */, true /* success */,
          locale.puzzleCompleted()),
      this.achievementRowGenerator(showNumBlocksRow, !tooManyBlocks,
          this.blocksUsedMessage(blockDelta, params)),
      this.achievementRowGenerator(true /* show */, !tooManyHints,
          this.hintsMessage(this.props.hintsUsed)),
    ].filter(row => row);

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose.bind(this, !tooManyBlocks)}
        assetUrl={this.props.assetUrl}
      >
        <StaggeredMotion
          defaultStyles={Array(achievementRowGenerators.length + 1).fill({ progress: 0 })}
          styles={prevInterpolatedStyles => prevInterpolatedStyles.map((_, i) => {
            return i === 0 ?
              { progress: spring(1, { stiffness: 100, damping: 25 }) } :
              { progress: spring(
                  prevInterpolatedStyles[i - 1].progress > (1 - ANIMATION_OVERLAP) ? 1 : 0,
                  { stiffness: 60, damping: 25 }),
              };
          })}
        >
          {interpolatingValues => {
              const interpolatingStyles =
                interpolatingValues.map(val => ({ opacity: val.progress }));
              return (<div>
                <div style={styles.checkmarks}>
                  {achievementRowGenerators.map((generator, index) =>
                          generator(interpolatingStyles[index + 1], index))}
                </div>
                {this.props.showStageProgress &&
                  <StageProgressBar
                    stageProgress={
                        this.props.oldStageProgress +
                        (interpolatingValues[1].progress * this.props.newPassedProgress) +
                        (interpolatingValues[2].progress * this.props.newPerfectProgress) +
                        (interpolatingValues[showNumBlocksRow ? 3 : 2].progress *
                          this.props.newHintUsageProgress)
                    }
                  />
                }
              </div>);
            }
          }
        </StaggeredMotion>
        <div style={styles.footer}>
          <p style={styles.feedbackMessage}>{feedbackMessage}</p>

          {this.props.showPuzzleRatingButtons && <PuzzleRatingButtons/>}
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
