import { StaggeredMotion, spring } from 'react-motion';
import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';
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
  pointRows: {
    position: 'absolute',
    top: 50,
    right: 90,
    left: 90,
    height: 230,
    padding: '32px 30px 20px 221px',
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
  bannerAchievement: {
    badge: {
      width: 175,
      height: 175,
      position: 'absolute',
      backgroundRepeat: 'no-repeat',
      top: 23,
      left: 114,
      color: 'white',
      textAlign: 'center',
      textShadow: '-2px 3px 2px rgba(0, 0, 0, 0.29)',
      transform: 'rotate(-15deg)',
      fontWeight: 'bold',
    },
    badgePoints: {
      fontSize: 61,
      marginTop: 63,
    },
    badgePointsLabel: {
      fontSize: 20,
      marginTop: 24,
    },
    banner: {
      backgroundColor: '#392E52',
      boxShadow: '0 2px 6px 0 rgba(0,0,0,0.29)',
      backgroundRepeat: 'no-repeat',
      backgroundPositionX: 9,
      backgroundPositionY: 7,
      borderRadius: 3,
      position: 'absolute',
      top: 212,
      left: 48,
      width: 603,
      height: 83,
    },
    bannerText: {
      fontFamily: '"Gotham 5r", sans-serif',
      fontSize: 30,
      color: 'white',
      letterSpacing: 4.55,
      marginTop: 33,
      textAlign: 'center',
    },
    point: {
      background: '#8676AB',
      borderRadius: 100,
      color: 'white',
      fontFamily: '"Gotham 7r", sans-serif',
      padding: '3px 10px',
    },
    row: {
      fontSize: 16,
      marginBottom: 25,
    },
    text: {
      fontFamily: '"Gotham 7r", sans-serif',
      color: '#544A6D',
      fontSize: 16,
      marginLeft: 10,
    },
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
    bannerMode: React.PropTypes.bool,
    totalPoints: React.PropTypes.number,
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

  achievementRow(show, successful, message) {
    if (!show || (this.props.bannerMode && !successful)) {
      return null;
    }

    return style => {
      if (this.props.bannerMode) {
        return (
          <p style={{...styles.bannerAchievement.row, ...style}}>
            <span style={styles.bannerAchievement.point}>+1</span>
            <span style={styles.bannerAchievement.text}>{message}</span>
          </p>
        );
      } else {
        return (
          <p style={{...styles.achievement.row, ...style}}>
            {this.icon(successful)}
            <span style={styles.achievement.text}>{message}</span>
          </p>
        );
      }
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

  hintsMessage(tooManyHints) {
    return tooManyHints ? locale.usingHints() : locale.withoutHints();
  },

  render() {
    const showNumBlocksRow = isFinite(this.props.idealBlocks);
    const blockDelta = this.props.actualBlocks - this.props.idealBlocks;
    const tooManyBlocks = blockDelta > 0;
    const tooManyHints = this.props.hintsUsed > 0;

    const params = {
      puzzleNumber: this.props.puzzleNumber,
      numBlocks: this.props.idealBlocks,
      numPoints: this.props.totalPoints,
    };
    let feedbackMessage;
    if (this.props.bannerMode) {
      feedbackMessage = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevelStars'](params);
    } else {
      feedbackMessage = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevel'](params);
    }
    const numPoints = 1 +
      (showNumBlocksRow && !tooManyBlocks ? 1 : 0) +
      (!tooManyHints ? 1 : 0);
    const dotsUrl = `url(${this.props.assetUrl('media/dialog/dots.png')})`;

    const achievementRows = [
      this.achievementRow(true /* show */, true /* success */,
          locale.puzzleCompleted()),
      this.achievementRow(showNumBlocksRow, !tooManyBlocks,
          this.blocksUsedMessage(blockDelta, params)),
      this.achievementRow(true /* show */, !tooManyHints,
          this.hintsMessage(tooManyHints)),
    ].filter(row => row);

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose.bind(this, !tooManyBlocks)}
        assetUrl={this.props.assetUrl}
      >
        <StaggeredMotion
          defaultStyles={Array(achievementRows.length + 1).fill({ progress: 0 })}
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
                <div style={this.props.bannerMode ? styles.pointRows : styles.checkmarks}>
                  {achievementRows.map((row, index) => row(interpolatingStyles[index + 1]))}
                </div>
                {this.props.bannerMode &&
                  <div
                    style={{
                      ...styles.bannerAchievement.badge,
                      backgroundImage: `url(${this.props.assetUrl('media/dialog/badge.png')})`,
                    }}
                  >
                    <div style={styles.bannerAchievement.badgePoints}>{numPoints}</div>
                    <div style={styles.bannerAchievement.badgePointsLabel}>{locale.pointsAllCaps({numPoints})}</div>
                  </div>
                }
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
                {this.props.bannerMode &&
                  <div
                    style={{
                      ...styles.bannerAchievement.banner,
                      backgroundImage: dotsUrl,
                    }}
                  >
                    <div style={styles.bannerAchievement.bannerText}>
                      {locale.congratsAllCaps()}
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
