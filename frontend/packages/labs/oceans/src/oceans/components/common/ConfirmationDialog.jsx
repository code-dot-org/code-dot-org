import React from 'react';
import PropTypes from 'prop-types';
import Radium from "radium";

import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEraser} from "@fortawesome/free-solid-svg-icons";

import snail from "@public/images/snail-large.png";

import styles from "@ml/oceans/styles";
import I18n from "@ml/oceans/i18n";
import Button from "@ml/oceans/components/common/Button";

let UnwrappedConfirmationDialog = class ConfirmationDialog extends React.Component {
  static propTypes = {
    onYesClick: PropTypes.func.isRequired,
    onNoClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <div style={styles.confirmationDialogBackground}>
        <div style={styles.confirmationDialog}>
          <div style={styles.confirmationDialogContent}>
            <img src={snail} style={styles.confirmationDialogImg} alt=""/>
            <div>
              <div
                style={styles.confirmationHeader}
                className="confirmation-text"
              >
                {I18n.t('areYouSure')}
              </div>
              <div style={styles.confirmationText}>
                {I18n.t('eraseWarning')}
              </div>
            </div>
          </div>
          <div style={styles.confirmationButtons}>
            <Button
              onClick={this.props.onYesClick}
              style={styles.confirmationYesButton}
              className="dialog-button"
            >
              <FontAwesomeIcon icon={faEraser}/> {I18n.t('erase')}
            </Button>
            <Button
              onClick={this.props.onNoClick}
              style={styles.confirmationNoButton}
              className="dialog-button"
            >
              {I18n.t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
};
export default Radium(UnwrappedConfirmationDialog);
