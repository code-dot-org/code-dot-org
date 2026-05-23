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
 * Uses a native <dialog> opened via showModal() so the browser provides Tab
 * trapping, focus restoration to the opener, and the :modal pseudo-class —
 * no manual JS keydown handler needed.
 *
 * The dialog is the card itself (position:fixed, viewport-centered).  The
 * browser's ::backdrop covers the page behind it; styled via scenes.css.
 *
 * Uses MUI Box rather than DSCO Dialog because the snail image hangs outside
 * the dialog box at -46 % bottom / -41 % left — a decorative overflow pattern
 * DSCO Dialog's chrome cannot accommodate.
 */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  /**
   * Ref to the native <dialog> element.  Typed as HTMLElement (the common
   * ancestor MUI Box infers) and narrowed to HTMLDialogElement at call sites.
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
    // close() returns focus to the element focused before showModal() was called.
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
        // Native cancel event fires on Escape; preventDefault stops the browser
        // from closing the dialog itself so our state-driven close runs instead.
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
              id="uitest-confirm-header"
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
                id="uitest-confirm-warning"
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
