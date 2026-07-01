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

/** Modal "are you sure you want to erase training?" dialog. */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  private opener: Element | null;

  constructor(props: ConfirmationDialogProps) {
    super(props);
    // Capture before autoFocus moves focus into the dialog.
    this.opener = document.activeElement;
  }

  componentWillUnmount() {
    (this.opener as HTMLElement | null)?.focus();
  }

  private onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      this.props.onNoClick();
    }
  };

  render() {
    return (
      // Full-canvas overlay: dims background and blocks pointer input.
      // Uses <dialog open> (not showModal) so it stays in normal flow and
      // can be positioned relative to the canvas, not the viewport top layer.
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: 100,
          borderRadius: '10px',
        }}
        onKeyDown={this.onKeyDown}
      >
        <Box
          component="dialog"
          {...({open: true} as React.DialogHTMLAttributes<HTMLDialogElement>)}
          aria-modal="true"
          aria-labelledby="confirm-header"
          aria-describedby="confirm-warning"
          sx={{
            // Reset UA <dialog> styles; center in the canvas via absolute + translate.
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            margin: 0,
            border: 'none',
            overflow: 'visible',
            maxWidth: 'none',
            maxHeight: 'none',
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
              // eslint-disable-next-line jsx-a11y/no-autofocus -- non-destructive default in a destructive modal
              autoFocus
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
