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

/** Modal erase-confirmation dialog. Built on the native <dialog> element so the browser handles focus trap, restoration, and backdrop. */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  /** Ref to the underlying <dialog>; narrowed to HTMLDialogElement at call sites. */
  private dialogRef = React.createRef<HTMLElement>();

  componentDidMount() {
    const dialog = this.dialogRef.current as HTMLDialogElement | null;
    if (!dialog) return;
    dialog.showModal();
    // Move focus from the destructive default to Cancel.
    const buttons = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );
    if (buttons.length > 0) {
      buttons[buttons.length - 1].focus();
    }
  }

  componentWillUnmount() {
    // Closing returns focus to the opener.
    const dialog = this.dialogRef.current as HTMLDialogElement | null;
    if (dialog?.open) {
      dialog.close();
    }
  }

  render() {
    return (
      <Box
        ref={this.dialogRef as React.Ref<HTMLDivElement>}
        component="dialog"
        aria-modal="true"
        aria-labelledby="confirm-header"
        aria-describedby="confirm-warning"
        // Route Escape through onNoClick so the parent owns dismissal.
        onCancel={(e: React.SyntheticEvent) => {
          e.preventDefault();
          this.props.onNoClick();
        }}
        sx={{
          // Reset UA <dialog> styles; center in the viewport via fixed + translate.
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          margin: 0,
          border: 'none',
          overflow: 'visible',
          maxWidth: 'none',
          maxHeight: 'none',
          // Visual appearance.
          backgroundColor: 'var(--ocean-color-white)',
          color: 'var(--ocean-color-dark-grey)',
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
              id="confirm-header"
              component="h2"
              sx={{
                fontSize: DIALOG_TITLE_FONT_SIZE,
                fontWeight: 'normal',
                fontFamily: 'inherit',
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
              <Typography
                id="confirm-warning"
                sx={{fontSize: 'inherit', fontFamily: 'inherit'}}
              >
                {I18n.t('eraseWarning')}
              </Typography>
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
    );
  }
}

export default ConfirmationDialog;
