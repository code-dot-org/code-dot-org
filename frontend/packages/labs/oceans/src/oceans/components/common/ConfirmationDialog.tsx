import {faEraser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Radium from 'radium';
import * as React from 'react';

import snail from '@/assets/images/snail-large.png';
import Button from '@/oceans/components/common/Button';
import I18n from '@/oceans/i18n';
import styles from '@/oceans/styles';

interface ConfirmationDialogProps {
  onYesClick: () => void;
  onNoClick: () => void;
}

const UnwrappedConfirmationDialog = class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  render() {
    return (
      <div style={styles.confirmationDialogBackground}>
        <div style={styles.confirmationDialog}>
          <div style={styles.confirmationDialogContent}>
            <img src={snail} style={styles.confirmationDialogImg} alt="" />
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
              <FontAwesomeIcon icon={faEraser} /> {I18n.t('erase')}
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
