import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import PropTypes from 'prop-types';
import React, {Component} from 'react';

import {getStore} from '@cdo/apps/redux';
import msg from '@cdo/locale';

import Lightbulb from '../templates/Lightbulb';

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
          <MuiButton variant="contained" color="primary" id="ok-button">
            {msg.dialogOK()}
          </MuiButton>
        </div>
      );
    }

    if (cancelText) {
      cancelButton = (
        <MuiButton
          {...(isDangerCancel
            ? {variant: 'contained', color: 'error'}
            : {variant: 'outlined', color: 'secondary'})}
          id="again-button"
        >
          {cancelText}
        </MuiButton>
      );
    }

    if (this.props.confirmText) {
      confirmButton = (
        <MuiButton
          variant="contained"
          color="primary"
          id="confirm-button"
          style={styles.confirmButton}
        >
          {this.props.confirmText}
        </MuiButton>
      );
    }

    if (this.props.tryAgain) {
      if (this.props.isK1 && !this.props.freePlay) {
        againButton = (
          <MuiButton
            variant="outlined"
            color="secondary"
            size="large"
            id="again-button"
          >
            {this.props.tryAgain}
          </MuiButton>
        );
      } else {
        if (this.props.shouldPromptForHint) {
          hintButton = (
            <MuiButton
              variant="outlined"
              color="secondary"
              id="hint-request-button"
              style={styles.hintButton}
            >
              <Lightbulb size={32} style={styles.lightbulb} />
              {msg.hintRequest()}
            </MuiButton>
          );
        }
        againButton = (
          <MuiButton variant="outlined" color="secondary" id="again-button">
            {this.props.tryAgain}
          </MuiButton>
        );
      }
    }

    if (this.props.nextLevel) {
      nextButton =
        this.props.isK1 && !this.props.freePlay ? (
          <MuiButton
            variant="contained"
            color="primary"
            size="large"
            endIcon={
              <FontAwesomeV6Icon
                iconName={isRtl ? 'chevron-left' : 'chevron-right'}
                iconStyle="solid"
              />
            }
            id="continue-button"
            style={isRtl ? styles.nextButtonRtl : styles.nextButton}
          >
            {this.props.continueText}
          </MuiButton>
        ) : (
          <MuiButton
            variant="contained"
            color="primary"
            id="continue-button"
            style={isRtl ? styles.nextButtonRtl : styles.nextButton}
          >
            {this.props.continueText}
          </MuiButton>
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
};
