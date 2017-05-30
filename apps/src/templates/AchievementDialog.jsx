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
    achievements: React.PropTypes.arrayOf(React.PropTypes.shape({
      check: React.PropTypes.bool,
      msg: React.PropTypes.string,
      progress: React.PropTypes.number,
    })),
    assetUrl: React.PropTypes.func,
    feedbackMessage: React.PropTypes.string,
    handleClose: React.PropTypes.func,
    isOpen: React.PropTypes.bool,
    oldStageProgress: React.PropTypes.number,
    onContinue: React.PropTypes.func,
    showPuzzleRatingButtons: React.PropTypes.bool,
    showStageProgress: React.PropTypes.bool,
    encourageRetry: React.PropTypes.bool,
  },

  getInitialState() {
    return {
      isOpen: this.props.isOpen === undefined ? true : this.props.isOpen,
    };
  },

  handleClose(nextPuzzle) {
    this.setState({isOpen: false});
    this.props.handleClose && this.props.handleClose();
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

  achievementRow(successful, message, style, index) {
    return (
      <p style={{...styles.achievement.row, ...style}} key={index}>
        {this.icon(successful)}
        <span style={styles.achievement.text}>{message}</span>
      </p>
    );
  },

  render() {
    const baseDialogProps = {...this.props};
    delete baseDialogProps.handleClose;

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose.bind(this, !this.props.encourageRetry)}
        assetUrl={this.props.assetUrl}
        {...baseDialogProps}
      >
        <StaggeredMotion
          defaultStyles={Array(this.props.achievements.length + 1).fill({ progress: 0 })}
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
                  {this.props.achievements.map((achievement, index) =>
                    this.achievementRow(
                        achievement.check,
                        achievement.msg,
                        interpolatingStyles[index + 1],
                        index))}
                </div>
                {this.props.showStageProgress &&
                  <StageProgressBar
                    stageProgress={
                        this.props.achievements.reduce((totalProgress, achievement, index) => {
                          return totalProgress +
                            (achievement.progress * interpolatingValues[index + 1].progress);
                        }, this.props.oldStageProgress)
                    }
                  />
                }
              </div>);
            }
          }
        </StaggeredMotion>
        <div style={styles.footer}>
          <p style={styles.feedbackMessage}>{this.props.feedbackMessage}</p>

          {this.props.showPuzzleRatingButtons && <PuzzleRatingButtons/>}
          <button
            onClick={this.handleClose.bind(this, true)}
            style={[
              styles.buttonPrimary,
              this.props.encourageRetry && styles.buttonSecondary
            ]}
          >
            {locale.continue()}
          </button>
          {this.props.encourageRetry &&
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
