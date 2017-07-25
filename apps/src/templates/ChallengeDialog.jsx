import BaseDialog from './BaseDialog';
import LegacyButton from './LegacyButton';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import Radium from 'radium';
import React from 'react';

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
  bannerComplete: {
    backgroundImage: `url(${assetUrl('media/dialog/challenge_target_complete.svg')})`,
    backgroundPositionY: -16,
  },
  content: {
    color: '#75699b',
    position: 'relative',
    textAlign: 'center',
    marginBottom: 30,
  },
  text: {
    margin: '0px 40px 20px',
    textAlign: 'center',
    fontSize: 18,
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
  primaryButton: {
    float: 'right',
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #ccc',
  },
});

const ChallengeDialog = Radium(React.createClass({
  propTypes: {
    assetUrl: React.PropTypes.func,
    avatar: React.PropTypes.string,
    cancelButtonLabel: React.PropTypes.string,
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ]),
    complete: React.PropTypes.bool,
    isOpen: React.PropTypes.bool,
    handleSkip: React.PropTypes.func,
    handleStart: React.PropTypes.func,
    hideBackdrop: React.PropTypes.bool,
    primaryButtonLabel: React.PropTypes.string,
    showPuzzleRatingButtons: React.PropTypes.bool,
    text: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  getInitialState() {
    return { isOpen: this.props.isOpen === undefined || this.props.isOpen };
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
        hideBackdrop={this.props.hideBackdrop}
      >
        <img className="modal-image" src={this.props.avatar} />
        <div
          style={{
            ...styles.banner,
            ...(this.props.complete ? styles.bannerComplete : {})
          }}
        >
          <h1 style={styles.title}>
            {this.props.title}
          </h1>
        </div>
        <div style={styles.content}>
          <div style={styles.text}>
            {this.props.text}
          </div>
          {this.props.children}
        </div>
        <LegacyButton type="cancel" onClick={this.handleSkip}>
          {this.props.cancelButtonLabel}
        </LegacyButton>
        <LegacyButton
          type="primary"
          style={styles.primaryButton}
          onClick={this.handleStart}
        >
          {this.props.primaryButtonLabel}
        </LegacyButton>
        {this.props.showPuzzleRatingButtons && <div style={styles.footer}>
          <PuzzleRatingButtons useLegacyStyles/>
        </div>}
      </BaseDialog>
    );
  },
}));

export default ChallengeDialog;
