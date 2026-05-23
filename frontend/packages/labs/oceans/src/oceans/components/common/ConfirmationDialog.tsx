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
 * Uses a canvas-relative backdrop (position: absolute, full canvas) so all
 * %-based sizes resolve against canvas width (1024 px), not the viewport.
 * This matches the ml-activities reference layout exactly and avoids the
 * top-layer centering problem that showModal() causes.
 *
 * Uses MUI Box rather than DSCO Dialog because the snail image hangs
 * outside the dialog box at -46 % bottom / -41 % left — a decorative
 * overflow pattern DSCO Dialog's chrome cannot accommodate.
 */
class ConfirmationDialog extends React.Component<ConfirmationDialogProps> {
  /**
   * Trap Tab within the two dialog buttons; close on Escape.
   * Replaces the native modal behaviour that showModal() would have provided.
   */
  private onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      this.props.onNoClick();
      return;
    }
    if (e.key !== 'Tab') return;

    const focusable = Array.from(
      e.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled])'),
    );
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  render() {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'var(--ocean-color-transparent-black)',
          borderRadius: '10px',
          zIndex: 1,
        }}
      >
        <Box
          role="dialog"
          aria-modal="true"
          aria-labelledby="uitest-confirm-header"
          aria-describedby="uitest-confirm-warning"
          onKeyDown={this.onKeyDown}
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            backgroundColor: 'var(--ocean-color-white)',
            color: 'var(--ocean-color-dark-grey)',
            padding: '2%',
            borderRadius: '8px',
            overflow: 'visible',
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
              // eslint-disable-next-line jsx-a11y/no-autofocus -- dialog opens on explicit user action (clicking Erase); autoFocus on Cancel steers keyboard users away from the destructive default
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
