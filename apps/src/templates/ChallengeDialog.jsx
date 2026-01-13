import Button, {buttonColors} from '@code-dot-org/component-library/button';
import PropTypes from 'prop-types';
import React from 'react';
import classNames from 'classnames';

import assetUrl from '@cdo/apps/code-studio/assetUrl';
import {getStore} from '@cdo/apps/redux';
import i18n from '@cdo/locale';

import BackToFrontConfetti from './BackToFrontConfetti';
import BaseDialog from './BaseDialog';
import PuzzleRatingButtons from './PuzzleRatingButtons';
import styles from './ChallengeDialog.module.scss';

class ChallengeDialog extends React.Component {
  static propTypes = {
    avatar: PropTypes.string,
    cancelButtonLabel: PropTypes.string,
    children: PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.arrayOf(PropTypes.node),
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
    levelId: PropTypes.number,
    unitId: PropTypes.number,
  };

  constructor(props) {
    super(props);
    this.state = {
      isOpen: this.props.isOpen === undefined || this.props.isOpen,
      confettiActive: false,
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
    const bannerImage = this.props.complete
      ? assetUrl('media/dialog/challenge_target_complete.svg')
      : assetUrl('media/dialog/challenge_target.svg');
    const bannerClassName = classNames(styles.banner, {
      [styles.bannerComplete]: this.props.complete,
    });
    const dialogStyle = {top: '20%'};
    const confettiStyle = {top: 150};

    return (
      <BaseDialog
        isOpen={this.state.isOpen}
        style={dialogStyle}
        handleClose={this.handlePrimary}
        hideCloseButton={true}
        hideBackdrop={this.props.hideBackdrop}
        bodyClassName={styles.dialogBody}
      >
        <img
          className="modal-image"
          src={this.props.avatar}
          alt={i18n.cheeringInstructorAltText()}
        />
        <div
          className={bannerClassName}
          style={{backgroundImage: `url(${bannerImage})`}}
        >
          <h1 className={styles.title} id="uitest-challenge-title">
            {this.props.title}
          </h1>
          <BackToFrontConfetti
            active={this.state.confettiActive}
            style={confettiStyle}
          />
        </div>
        <div className={styles.content}>
          {this.props.text && <div className={styles.text}>{this.props.text}</div>}
          {this.props.children}
        </div>
        <Button
          id="challengeCancelButton"
          onClick={this.handleCancel}
          text={this.props.cancelButtonLabel}
          type="secondary"
          color={buttonColors.gray}
        />
        <Button
          id="challengePrimaryButton"
          onClick={this.handlePrimary}
          text={this.props.primaryButtonLabel}
          type="primary"
          color={buttonColors.purple}
          className={isRtl ? styles.primaryButtonRtl : styles.primaryButton}
        />
        {this.props.showPuzzleRatingButtons && (
          <div className={styles.footer}>
            <PuzzleRatingButtons
              useLegacyStyles
              levelId={this.props.levelId}
              unitId={this.props.unitId}
            />
          </div>
        )}
      </BaseDialog>
    );
  }
}

export default ChallengeDialog;
