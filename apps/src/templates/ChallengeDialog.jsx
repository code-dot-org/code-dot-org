import BackToFrontConfetti from './BackToFrontConfetti';
import BaseDialog from './BaseDialog';
import LegacyButton from './LegacyButton';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import PropTypes from 'prop-types';
import Radium from 'radium';
import React from 'react';
import assetUrl from '@cdo/apps/code-studio/assetUrl';
import color from '../util/color';
import {getStore} from '@cdo/apps/redux';

class ChallengeDialog extends React.Component {
  static propTypes = {
    avatar: PropTypes.string,
    cancelButtonLabel: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node)
    ]),
    complete: PropTypes.bool,
    isIntro: PropTypes.bool,
    isOpen: PropTypes.bool,
    handleCancel: PropTypes.func,
    handlePrimary: PropTypes.func,
    hideBackdrop: PropTypes.bool,
    primaryButtonLabel: PropTypes.string,
    showPuzzleRatingButtons: PropTypes.bool,
    text: PropTypes.string,
    title: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen === undefined || this.props.isOpen,
      confettiActive: false
    };
  }

  handlePrimary = () => {
    this.props.handlePrimary && this.props.handlePrimary();
    this.setState({isOpen: false});
  };

  handleCancel = () => {
    this.props.handleCancel && this.props.handleCancel();
    this.setState({isOpen: false});
  };

  componentDidMount() {
    if (this.props.complete && !this.props.isIntro) {
      // The confetti only starts when the `active` prop transitions from false
      // to true, so this defaults to false but is immediately set to true
      window.setTimeout(() => this.setState({confettiActive: true}), 0);
    }
  }

  render() {
    const isRtl = getStore().getState().isRtl;

    return (
      <BaseDialog
        isOpen={this.state.isOpen}
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
          <h1 style={styles.title} id="uitest-challenge-title">
            {this.props.title}
          </h1>
          <BackToFrontConfetti
            active={this.state.confettiActive}
            style={styles.confetti}
          />
        </div>
        <div style={styles.content}>
          <div style={styles.text}>{this.props.text}</div>
          {this.props.children}
        </div>
        <LegacyButton
          type="cancel"
          onClick={this.handleCancel}
          id="challengeCancelButton"
        >
          {this.props.cancelButtonLabel}
        </LegacyButton>
        <LegacyButton
          type="primary"
          style={isRtl ? styles.primaryButtonRtl : styles.primaryButton}
          onClick={this.handlePrimary}
          id="challengePrimaryButton"
        >
          {this.props.primaryButtonLabel}
        </LegacyButton>
        {this.props.showPuzzleRatingButtons && (
          <div style={styles.footer}>
            <PuzzleRatingButtons useLegacyStyles />
          </div>
        )}
      </BaseDialog>
    );
  }
}

const styles = {
  dialog: {
    top: '20%',
    border: `5px solid ${color.purple}`,
    borderRadius: 10
  },
  banner: {
    backgroundPosition: 'top center',
    backgroundRepeat: 'no-repeat',
    backgroundImage: `url(${assetUrl('media/dialog/challenge_target.svg')})`,
    position: 'relative',
    marginTop: -85,
    height: 135
  },
  bannerComplete: {
    backgroundImage: `url(${assetUrl(
      'media/dialog/challenge_target_complete.svg'
    )})`,
    marginTop: -99,
    height: 149
  },
  content: {
    color: color.purple,
    position: 'relative',
    textAlign: 'center',
    marginBottom: 30
  },
  text: {
    margin: '0px 40px 20px',
    textAlign: 'center',
    fontSize: 18
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
    lineHeight: '30px'
  },
  confetti: {
    top: 150
  },
  primaryButton: {
    float: 'right'
  },
  primaryButtonRtl: {
    float: 'left'
  },
  footer: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: '2px solid #ccc'
  }
};

export default Radium(ChallengeDialog);
