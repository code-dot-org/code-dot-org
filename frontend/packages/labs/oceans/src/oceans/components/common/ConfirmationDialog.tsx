import {faEraser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import Box from '@mui/material/Box';
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
      <Box className="ocean-confirmation-dialog__bg">
        <Box className="ocean-confirmation-dialog">
          <Box className="ocean-confirmation-dialog__content">
            <img
              src={snail}
              className="ocean-confirmation-dialog__img"
              alt=""
            />
            <Box>
              <Box className="ocean-confirmation-dialog__header confirmation-text">
                {I18n.t('areYouSure')}
              </Box>
              <Box className="ocean-confirmation-dialog__text">
                {I18n.t('eraseWarning')}
              </Box>
            </Box>
          </Box>
          <Box className="ocean-confirmation-dialog__buttons">
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
          </Box>
        </Box>
      </Box>
    );
  }
}

export default ConfirmationDialog;
