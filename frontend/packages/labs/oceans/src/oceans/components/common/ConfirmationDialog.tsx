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
      <Box
        sx={{
          backgroundColor: 'var(--ocean-color-transparent-black)',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          borderRadius: '10px',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            backgroundColor: 'var(--ocean-color-white)',
            color: 'var(--ocean-color-dark-grey)',
            transform: 'translate(-50%, -50%)',
            top: '50%',
            bottom: 'initial',
            left: '50%',
            padding: '2%',
            borderRadius: '8px',
          }}
        >
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <img
              src={snail}
              style={{
                position: 'absolute',
                bottom: '-46%',
                left: '-41%',
                height: '100%',
              }}
              alt=""
            />
            <Box>
              {/* confirmation-text is a test-hook class. */}
              <Box
                className="confirmation-text"
                sx={{
                  fontSize: '220%',
                  color: 'var(--ocean-color-dark-grey)',
                  paddingBottom: '5%',
                  textAlign: 'center',
                }}
              >
                {I18n.t('areYouSure')}
              </Box>
              <Box
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'var(--ocean-color-light-grey)',
                  padding: '5%',
                  borderRadius: '5px',
                }}
              >
                {I18n.t('eraseWarning')}
              </Box>
            </Box>
          </Box>
          <Box sx={{paddingTop: '5%', clear: 'both'}}>
            {/* dialog-button is a test-hook class. */}
            <Button
              onClick={this.props.onYesClick}
              className="dialog-button"
              sx={{
                backgroundColor: 'var(--ocean-color-red)',
                color: 'var(--ocean-color-white)',
                left: '5%',
                padding: '3.5% 8%',
                width: '35%',
              }}
            >
              <FontAwesomeIcon icon={faEraser} /> {I18n.t('erase')}
            </Button>
            <Button
              onClick={this.props.onNoClick}
              className="dialog-button"
              sx={{
                backgroundColor: 'var(--ocean-color-orange)',
                color: 'var(--ocean-color-white)',
                float: 'right',
                right: '5%',
                padding: '3.5% 8%',
                width: '35%',
              }}
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
