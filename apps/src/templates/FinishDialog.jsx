import { connect } from 'react-redux';
import { hideFeedback } from '../redux/feedback';
import BaseDialog from './BaseDialog';
import PuzzleRatingButtons from  './PuzzleRatingButtons';
import React, { Component, PropTypes } from 'react';
import color from '../util/color';
import msg from '@cdo/locale';

const styles = {
  wrapper: {
    position: 'fixed',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    margin: 'auto',
    width: 375,
    height: 280,
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
    borderColor: color.level_perfect,
    borderWidth: 7,
    borderStyle: 'solid',
    width: 60,
    height: 60,
    borderRadius: '50%',
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
    margin: 10,
    verticalAlign: 'middle',
  },
  blockCountPerfect: {
    color: color.level_perfect,
  },
  blockCountPass: {
    color: color.light_teal,
  },
  blockCountDescriptor: {
    borderWidth: 1,
    borderStyle: 'solid',
    fontFamily: '"Gotham 5r", sans-serif',
    borderRadius: 5,
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
  continueButton: {
    backgroundColor: color.orange,
  },
};

export class UnconnectedFinishDialog extends Component {
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
  };

  getBubble() {
    return (
      <div style={styles.bubbleContainer}>
        <div
          className="uitest-bubble"
          style={{
            ...styles.bubble,
            backgroundColor:
              this.props.isPerfect ? color.level_perfect : color.level_passed,
          }}
        />
      </div>
    );
  }

  getBlockCountDescription() {
    if (this.props.blocksUsed < this.props.blockLimit) {
      return msg.betterThanPerfectDescription();
    }
    if (this.props.blocksUsed === this.props.blockLimit) {
      return msg.perfectDescription();
    }
    if (this.props.blocksUsed > this.props.blockLimit) {
      return msg.tooManyBlocksDescription();
    }
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
            {(this.props.blocksUsed || 0).toString()}
            {this.props.blockLimit && ('/' + this.props.blockLimit.toString())}
          </span>
          <span style={styles.blockCountDescriptor}>
            {this.getBlockCountDescription()}
          </span>
        </span>
      </div>
    );
  }

  getAchievements() {
    if (!this.props.achievements || this.props.achievements.length === 0) {
      return null;
    }

    return (
      <div style={styles.achievements}>
        {this.props.achievements.map((achievement, index) => (
          <div
            key={index}
            style={{
              ...styles.achievementRow,
              ...(achievement.isAchieved ? {} : {color: color.lighter_gray}),
            }}
          >
            <img
              src={achievement.isAchieved ?
                achievement.successIconUrl :
                achievement.failureIconUrl}
              style={styles.achievementIcon}
            />
            {achievement.message}
          </div>
        ))}
      </div>
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
    return [
      <button
        key="replay"
        style={{...styles.button, ...styles.replayButton}}
        onClick={this.props.onReplay}
      >
        Replay
      </button>,
      <button
        key="contnue"
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
        <div style={this.props.hideBackdrop ? {} : styles.wrapper}>
          <div
            style={styles.modal}
          >
            <div style={styles.header}>
              {this.getBubble()}
            </div>
            <div style={styles.content}>
              {this.getBlockCounter()}
              {this.getAchievements()}
              {this.getFunometer()}
            </div>
          </div>
          <div style={styles.buttonContainer}>
            {this.getButtons()}
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
}), dispatch => ({
  onReplay: () => dispatch(hideFeedback()),
}))(UnconnectedFinishDialog);
