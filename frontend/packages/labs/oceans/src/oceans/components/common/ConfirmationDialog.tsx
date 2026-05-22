import {faEraser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import * as React from 'react';

import snail from '@/assets/images/snail-large.png';
import Button from '@/oceans/components/common/Button';
import I18n from '@/oceans/i18n';

interface ConfirmationDialogProps {
  onYesClick: () => void;
  onNoClick: () => void;
}

/** Modal "are you sure you want to erase training?" dialog. */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  render() {
    return (
      <div className="ocean-confirmation-dialog__bg">
        <div className="ocean-confirmation-dialog">
          <div className="ocean-confirmation-dialog__content">
            <img
              src={snail}
              className="ocean-confirmation-dialog__img"
              alt=""
            />
            <div>
              <div className="ocean-confirmation-dialog__header confirmation-text">
                {I18n.t('areYouSure')}
              </div>
              <div className="ocean-confirmation-dialog__text">
                {I18n.t('eraseWarning')}
              </div>
            </div>
          </div>
          <div className="ocean-confirmation-dialog__buttons">
            <Button
              onClick={this.props.onYesClick}
              className="ocean-confirmation-dialog__yes-button dialog-button"
            >
              <FontAwesomeIcon icon={faEraser} /> {I18n.t('erase')}
            </Button>
            <Button
              onClick={this.props.onNoClick}
              className="ocean-confirmation-dialog__no-button dialog-button"
            >
              {I18n.t('cancel')}
            </Button>
          </div>
        </div>
      </div>
    );
  }
}

export default ConfirmationDialog;
