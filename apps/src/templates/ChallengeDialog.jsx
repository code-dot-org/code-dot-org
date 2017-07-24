import BaseDialog from './BaseDialog';
import LegacyButton from './LegacyButton';
import Radium from 'radium';
import React from 'react';
import locale from '@cdo/locale';

const stylesGenerator = assetUrl => ({
  dialog: {
    top: '20%',
    border: '5px solid #75699b',
    borderRadius: 10,
  },
  banner: {
    background: `top center no-repeat url(${assetUrl('media/dialog/challenge_target.svg')})`,
    position: 'relative',
    marginTop: -85,
    height: 135,
  },
  title: {
    textAlign: 'center',
    position: 'absolute',
    bottom: 0,
    color: '#fff',
    backgroundColor: '#75699b',
    border: '3px solid white',
    minWidth: '50%',
    left: '25%',
    fontSize: '150%',
    height: 30,
    lineHeight: '30px',
  },
  introText: {
    color: '#75699b',
    width: '60%',
    position: 'relative',
    left: '20%',
    textAlign: 'center',
    marginBottom: 30,
    fontSize: '12pt',
  },
  primaryButton: {
    float: 'right',
  },
});

const ChallengeDialog = Radium(React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func,
    avatar: React.PropTypes.string,
    isOpen: React.PropTypes.bool,
    handleSkip: React.PropTypes.func,
    handleStart: React.PropTypes.func,
  },

  getInitialState() {
    return { isOpen: true };
  },

  handleStart() {
    this.setState({ isOpen: false });
    this.props.handleStart && this.props.handleStart();
  },

  handleSkip() {
    if (!this.state.skipped) {
      this.props.handleSkip && this.props.handleSkip();
      this.setState({ skipped: true });
    }
  },

  render() {
    const styles = stylesGenerator(this.props.assetUrl);
    return (
      <BaseDialog
        isOpen={this.state.isOpen}
        assetUrl={this.props.assetUrl}
        style={styles.dialog}
        handleClose={this.handleStart}
        hideCloseButton={true}
      >
        <img className="modal-image" src={this.props.avatar} />
        <div style={styles.banner}>
          <h1 style={styles.title}>
            {locale.challengeLevelTitle()}
          </h1>
        </div>
        <div style={styles.introText}>
          {locale.challengeLevelIntro()}
        </div>
        <LegacyButton type="cancel" onClick={this.handleSkip}>
          {locale.challengeLevelSkip()}
        </LegacyButton>
        <LegacyButton
          type="primary"
          style={styles.primaryButton}
          onClick={this.handleStart}
        >
          {locale.challengeLevelStart()}
        </LegacyButton>
      </BaseDialog>
    );
  },
}));

export default ChallengeDialog;
