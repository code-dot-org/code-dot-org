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
 * Uses a native <dialog> element opened via showModal().  The browser handles
 * Tab trapping, focus restoration to the opener, and aria-modal semantics —
 * no JS keydown handler needed.
 *
 * Uses MUI Box rather than DSCO Dialog because the snail image is positioned
 * absolutely at -46 % bottom / -41 % left — hanging outside the dialog box.
 * DSCO Dialog's chrome (title bar, close button, inline image slot) does not
 * accommodate this decorative overflow pattern.  A dedicated UX-improvement PR
 * should evaluate adopting DSCO Dialog with a redesigned snail placement.
 */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  /**
   * Ref to the native <dialog> element.  Typed as HTMLElement (common ancestor)
   * because MUI Box doesn't infer HTMLDialogElement for component="dialog"; we
   * narrow to HTMLDialogElement at the call site.
   */
  private dialogRef = React.createRef<HTMLElement>();

  componentDidMount() {
    const dialog = this.dialogRef.current as HTMLDialogElement | null;
    if (!dialog) return;
    dialog.showModal();
    // showModal() focuses the first focusable element (Erase — destructive).
    // Override to Cancel as the safer default.
    const buttons = dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled])',
    );
    if (buttons.length > 0) {
      buttons[buttons.length - 1].focus();
    }
  }

  componentWillUnmount() {
    // close() returns focus to the element focused when showModal() was called.
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
        aria-labelledby="uitest-confirm-header"
        aria-describedby="uitest-confirm-warning"
        sx={{
          // Reset UA <dialog> styles; center via fixed + translate.
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
              <Typography id="uitest-confirm-warning">
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
