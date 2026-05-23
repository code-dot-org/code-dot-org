import {faEraser} from '@fortawesome/free-solid-svg-icons';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {Box, Typography} from '@mui/material';
import * as React from 'react';

import snail from '@/assets/images/snail-large.png';
import Button from '@/oceans/components/common/Button';
import I18n from '@/oceans/i18n';
import {DIALOG_TITLE_FONT_SIZE} from '@/oceans/styles/layout';

/** Base sx shared by the Yes and No buttons. */
const dialogButtonBaseSx = {
  padding: '3.5% 8%',
  width: '35%',
  color: 'var(--ocean-color-white)',
} as const;

interface ConfirmationDialogProps {
  onYesClick: () => void;
  onNoClick: () => void;
}

/**
 * Modal "are you sure you want to erase training?" dialog.
 *
 * Uses MUI Box rather than DSCO Dialog because the snail image is positioned
 * absolutely at -46 % bottom / -41 % left — hanging outside the dialog box.
 * DSCO Dialog's chrome (title bar, close button, inline image slot) does not
 * accommodate this decorative overflow pattern.  A dedicated UX-improvement PR
 * should evaluate adopting DSCO Dialog with a redesigned snail placement.
 */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  /**
   * The element that had focus when the dialog opened.
   * Captured on mount and restored on unmount (ARIA dialog pattern).
   */
  private previousFocus: HTMLElement | null = null;

  componentDidMount() {
    this.previousFocus = document.activeElement as HTMLElement | null;
  }

  componentWillUnmount() {
    this.previousFocus?.focus();
  }

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
          role="dialog"
          aria-labelledby="uitest-confirm-header"
          sx={{
            position: 'absolute',
            backgroundColor: 'var(--ocean-color-white)',
            color: 'var(--ocean-color-dark-grey)',
            transform: 'translate(-50%, -50%)',
            top: '50%',
            left: '50%',
            padding: '2%',
            borderRadius: '8px',
          }}
        >
          <Box sx={{display: 'flex', justifyContent: 'space-between'}}>
            <Box
              component="img"
              src={snail}
              alt=""
              sx={{
                position: 'absolute',
                bottom: '-46%',
                left: '-41%',
                height: '100%',
              }}
            />
            <Box>
              <Typography
                id="uitest-confirm-header"
                component="h2"
                sx={{
                  fontSize: DIALOG_TITLE_FONT_SIZE,
                  color: 'var(--ocean-color-dark-grey)',
                  paddingBottom: '5%',
                  textAlign: 'center',
                }}
              >
                {I18n.t('areYouSure')}
              </Typography>
              <Box
                sx={{
                  textAlign: 'center',
                  backgroundColor: 'var(--ocean-color-light-grey)',
                  padding: '5%',
                  borderRadius: '5px',
                }}
              >
                <Typography>{I18n.t('eraseWarning')}</Typography>
              </Box>
            </Box>
          </Box>
          <Box sx={{paddingTop: '5%', clear: 'both'}}>
            <Button
              onClick={this.props.onYesClick}
              sx={[
                dialogButtonBaseSx,
                {
                  backgroundColor: 'var(--ocean-color-red)',
                  left: '5%',
                  '&:hover': {backgroundColor: 'var(--ocean-color-red)'},
                },
              ]}
            >
              <FontAwesomeIcon icon={faEraser} aria-hidden /> {I18n.t('erase')}
            </Button>
            <Button
              onClick={this.props.onNoClick}
              sx={[
                dialogButtonBaseSx,
                {
                  backgroundColor: 'var(--ocean-color-orange)',
                  float: 'right',
                  right: '5%',
                  '&:hover': {backgroundColor: 'var(--ocean-color-orange)'},
                },
              ]}
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
