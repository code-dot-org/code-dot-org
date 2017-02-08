import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';

const styles = {
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
  },

  render() {
    const params = {puzzleNumber: this.props.puzzleNumber, numBlocks: this.props.idealBlocks};
    const blockDelta = this.props.actualBlocks - this.props.idealBlocks;
    const tooManyBlocks = blockDelta > 0;
    const message = locale[tooManyBlocks ? 'numBlocksNeeded' : 'nextLevel'](params);

    return (
      <BaseDialog useUpdatedStyles isOpen={true} assetUrl={this.props.assetUrl}>
        <div style={styles.footer}>
          <p style={styles.feedbackMessage}>{message}</p>
          <button
            style={[
              styles.buttonPrimary,
              tooManyBlocks && styles.buttonSecondary
            ]}
          >
            {locale.continue()}
          </button>
          {tooManyBlocks &&
            <button style={styles.buttonPrimary}>{locale.tryAgain()}</button>
          }
        </div>
      </BaseDialog>
    );
  }
}));

export default AchievementDialog;
