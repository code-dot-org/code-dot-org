import React from 'react';
import Radium from 'radium';
import BaseDialog from './BaseDialog';
import color from "../util/color";
import locale from '@cdo/locale';
import StageProgressBar from './StageProgressBar';

const styles = {
  stars: {
    position: 'absolute',
    top: 40,
    right: 120,
    left: 120,
    height: 230,
    padding: '50px 30px 50px 80px',
    boxSizing: 'border-box',
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

const StageAchievementDialog = Radium(React.createClass({
  propTypes: {
    stageName: React.PropTypes.string,
    assetUrl: React.PropTypes.func,
    onContinue: React.PropTypes.func,
    showStageProgress: React.PropTypes.bool,
    newStageProgress: React.PropTypes.number,
    numStars: React.PropTypes.number,
  },

  getInitialState() {
    return {isOpen: true};
  },

  handleClose() {
    this.setState({isOpen: false});
    this.props.onContinue();
  },

  render() {
    const params = {
      stageName: this.props.stageName,
    };
    const feedbackMessage = locale['nextStage'](params);

    const starImages = {};
    [1, 2, 3].map(n => {
      starImages[n] = {
        background: `center top url(${this.props.assetUrl(`media/dialog/${n}-star.png`)}) no-repeat`,
      };
    });

    return (
      <BaseDialog
        useUpdatedStyles
        isOpen={this.state.isOpen}
        handleClose={this.handleClose}
        assetUrl={this.props.assetUrl}
      >
        <div>
          <div
            style={{
              ...styles.stars,
              ...starImages[this.props.numStars],
            }}
          />
          {this.props.showStageProgress &&
            <StageProgressBar stageProgress={this.props.newStageProgress} />
          }
        </div>
        <div style={styles.footer}>
          <p style={styles.feedbackMessage}>{feedbackMessage}</p>

          <button
            onClick={this.handleClose}
            style={styles.buttonPrimary}
          >
            {locale.continue()}
          </button>
        </div>
      </BaseDialog>
    );
  }
}));

export default StageAchievementDialog;
