import BaseDialog from './BaseDialog';
import Confetti from 'react-dom-confetti';
import LegacyButton from './LegacyButton';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import Radium from 'radium';
import React, {PropTypes} from 'react';
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
  confetti: {
    position: 'relative',
    left: '50%',
    top: 150,
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
    title: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen === undefined || this.props.isOpen,
      confettiActive: false,
      confettiOnTop: false,
    };
  }

  handlePrimary = () => {
    this.props.handlePrimary && this.props.handlePrimary();
    this.setState({ isOpen: false });
  };

  handleCancel = () => {
    this.props.handleCancel && this.props.handleCancel();
    this.setState({ isOpen: false });
  };

  componentDidMount() {
    if (this.props.complete && !this.props.isIntro) {
      // The confetti only starts when the `active` prop transitions from false
      // to true, so this defaults to false but is immediately set to true
      window.setTimeout(() => this.setState({ confettiActive: true }), 0);

      // I want the confetti to shoot up from behind the dialog and fall in
      // front of it. Fake it by changing the z-index from -1 to 1 after 700ms
      window.setTimeout(() => this.setState({ confettiOnTop: true }), 700);
    }
  }

  render() {
    const confettiZIndex = this.state.confettiOnTop ? 1: -1;
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
          <div style={{...styles.confetti, zIndex: confettiZIndex}}>
            <Confetti active={this.state.confettiActive} />
          </div>
        </div>
        <div style={styles.content}>
          <div style={styles.text}>
            {this.props.text}
          </div>
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
          style={styles.primaryButton}
          onClick={this.handlePrimary}
          id="challengePrimaryButton"
        >
          {this.props.primaryButtonLabel}
        </LegacyButton>
        {this.props.showPuzzleRatingButtons && <div style={styles.footer}>
          <PuzzleRatingButtons useLegacyStyles/>
        </div>}
      </BaseDialog>
    );
  }
}

export default Radium(ChallengeDialog);
