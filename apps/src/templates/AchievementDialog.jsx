import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';

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

  achievementRow(flag, message) {
    return (
      <p style={styles.achievement.row}>
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

  render() {
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
        <div style={styles.checkmarks}>
          {this.achievementRow(true, locale.puzzleCompleted())}
          {this.achievementRow(!tooManyBlocks, this.blocksUsedMessage(blockDelta, params))}
          {this.achievementRow(!tooManyHints, this.hintsMessage(tooManyHints))}
        </div>
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
