import BaseDialog from './BaseDialog';
import LegacyButton from './LegacyButton';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import Radium from 'radium';
import React from 'react';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import color from '../util/color';

const styles = {
  dialog: {
    top: '20%',
    border: `5px solid ${color.purple}`,
    borderRadius: 10,
  },
  banner: {
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${assetUrl('media/dialog/challenge_target.svg')})`,
    position: 'relative',
    marginTop: -85,
    height: 135,
  },
  bannerComplete: {
    backgroundImage: `url(${assetUrl('media/dialog/challenge_target_complete.svg')})`,
    marginTop: -99,
    height: 149,
  },
  content: {
    color: color.purple,
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
    backgroundColor: color.purple,
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
};

const ChallengeDialog = Radium(React.createClass({
  propTypes: {
    avatar: React.PropTypes.string,
    cancelButtonLabel: React.PropTypes.string,
    children: React.PropTypes.oneOfType([
      React.PropTypes.node,
      React.PropTypes.arrayOf(React.PropTypes.node)
    ]),
    complete: React.PropTypes.bool,
    isOpen: React.PropTypes.bool,
    handleCancel: React.PropTypes.func,
    handlePrimary: React.PropTypes.func,
    hideBackdrop: React.PropTypes.bool,
    primaryButtonLabel: React.PropTypes.string,
    showPuzzleRatingButtons: React.PropTypes.bool,
    text: React.PropTypes.string,
    title: React.PropTypes.string,
  },

  getInitialState() {
    return { isOpen: this.props.isOpen === undefined || this.props.isOpen };
  },

  handlePrimary() {
    this.props.handlePrimary && this.props.handlePrimary();
    this.setState({ isOpen: false });
  },

  handleCancel() {
    this.props.handleCancel && this.props.handleCancel();
    this.setState({ isOpen: false });
  },

  render() {
    return (
      <BaseDialog
        isOpen={this.state.isOpen}
        assetUrl={assetUrl}
        style={styles.dialog}
        handleClose={this.handlePrimary}
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
        <LegacyButton type="cancel" onClick={this.handleCancel}>
          {this.props.cancelButtonLabel}
        </LegacyButton>
        <LegacyButton
          type="primary"
          style={styles.primaryButton}
          onClick={this.handlePrimary}
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
