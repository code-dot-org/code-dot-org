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
    padding: '50px 100px',
    boxSizing: 'border-box',
    background: '#fff',
    borderRadius: 8,
    boxShadow: '0 2px 7px 2px rgba(0, 0, 0, 0.3)',
    color: color.purple,
  },
  achievement: {
    row: {
      lineHeight: '28px',
    },
    icon: {
      fontSize: 30,
      verticalAlign: 'middle',
      width: 30,
      marginRight: 10,
    },
    text: {
      fontSize: 20,
      color: '#392e52',
      verticalAlign: 'middle',
    },
    inactive: {
      color: '#aaa',
    }
  },
  feedbackMessage: {
    fontSize: 18,
    textAlign: 'center',
    color: '#4e5665',
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

  render() {
    const params = {
      puzzleNumber: this.props.puzzleNumber,
      numBlocks: this.props.idealBlocks
    };
    const blockDelta = this.props.actualBlocks - this.props.idealBlocks;
    const tooManyBlocks = blockDelta > 0;
    const message = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevel'](params);

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose.bind(this, !tooManyBlocks)}
        assetUrl={this.props.assetUrl}
      >
        <div style={styles.checkmarks}>
          <p style={styles.achievement.row}>
            <i className="fa fa-check-square-o" style={styles.achievement.icon}/>
            <span style={styles.achievement.text}>Puzzle completed!</span>
          </p>
          <p style={styles.achievement.row}>
            <i className="fa fa-square-o" style={[styles.achievement.icon, styles.achievement.inactive]}/>
            <span style={[styles.achievement.text, styles.achievement.inactive]}>Too many blocks</span>
          </p>
          <p style={styles.achievement.row}>
            <i className="fa fa-square-o" style={[styles.achievement.icon, styles.achievement.inactive]}/>
            <span style={[styles.achievement.text, styles.achievement.inactive]}>2 hints used</span>
          </p>
        </div>
        <div style={styles.footer}>

          <p style={styles.feedbackMessage}>{message}</p>

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
