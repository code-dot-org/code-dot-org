import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {getStore} from '@cdo/apps/redux';
import msg from '@cdo/locale';

import Lightbulb from '../templates/Lightbulb';

import LegacyButton from './LegacyButton';

export default class DialogButtons extends Component {
  static propTypes = {
    assetUrl: PropTypes.func,
    cancelText: PropTypes.string,
    isDangerCancel: PropTypes.bool,
    confirmText: PropTypes.string,
    continueText: PropTypes.string,
    freePlay: PropTypes.bool,
    isK1: PropTypes.bool,
    nextLevel: PropTypes.bool,
    ok: PropTypes.bool,
    shouldPromptForHint: PropTypes.bool,
    tryAgain: PropTypes.string,
  };

  render() {
    const {isDangerCancel, cancelText} = this.props;

    let okButton,
      cancelButton,
      confirmButton,
      hintButton,
      againButton,
      nextButton;

    const isRtl = getStore().getState().isRtl;

    if (this.props.ok) {
      okButton = (
        <div className="farSide">
          <LegacyButton type="primary" id="ok-button">
            {msg.dialogOK()}
          </LegacyButton>
        </div>
      );
    }

    if (cancelText) {
      cancelButton = (
        <LegacyButton
          type={isDangerCancel ? 'danger' : 'cancel'}
          id="again-button"
        >
          {cancelText}
        </LegacyButton>
      );
    }

    if (this.props.confirmText) {
      confirmButton = (
        <LegacyButton
          type="primary"
          id="confirm-button"
          className="launch"
          style={styles.confirmButton}
        >
          {this.props.confirmText}
        </LegacyButton>
      );
    }

    if (this.props.tryAgain) {
      if (this.props.isK1 && !this.props.freePlay) {
        againButton = (
          <LegacyButton
            type="cancel"
            size="large"
            style={styles.againButtonFormerArrowBtn}
            id="again-button"
            className="launch"
          >
            {this.props.tryAgain}
          </LegacyButton>
        );
      } else {
        if (this.props.shouldPromptForHint) {
          hintButton = (
            <LegacyButton
              type="default"
              id="hint-request-button"
              style={styles.hintButton}
            >
              <Lightbulb size={32} style={styles.lightbulb} />
              {msg.hintRequest()}
            </LegacyButton>
          );
        }
        againButton = (
          <LegacyButton type="cancel" id="again-button" className="launch">
            {this.props.tryAgain}
          </LegacyButton>
        );
      }
    }

    if (this.props.nextLevel) {
      nextButton =
        this.props.isK1 && !this.props.freePlay ? (
          <LegacyButton
            type="legacyPrimary"
            size="large"
            arrow={isRtl ? 'left' : 'right'}
            id="continue-button"
            className="launch"
            style={isRtl ? styles.nextButtonRtl : styles.nextButton}
          >
            {this.props.continueText}
          </LegacyButton>
        ) : (
          <LegacyButton
            type="legacyPrimary"
            id="continue-button"
            className="launch"
            style={isRtl ? styles.nextButtonRtl : styles.nextButton}
          >
            {this.props.continueText}
          </LegacyButton>
        );
    }

    return (
      <div>
        {okButton}
        {cancelButton}
        {confirmButton}
        {hintButton}
        {againButton}
        {nextButton}
      </div>
    );
  }
}

const styles = {
  confirmButton: {
    float: 'right',
  },
  nextButton: {
    float: 'right',
  },
  nextButtonRtl: {
    float: 'left',
  },
  lightbulb: {
    margin: '-9px 0px -9px -5px',
  },
  hintButton: {
    marginRight: 10,
  },
  againButtonFormerArrowBtn: {
    marginTop: 25.5,
  },
};
