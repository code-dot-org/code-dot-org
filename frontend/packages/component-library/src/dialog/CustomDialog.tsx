import {Dialog as MuiDialog} from '@mui/material';
import classnames from 'classnames';
import omit from 'lodash/omit';
import {forwardRef, HTMLAttributes, ReactNode, useEffect, useRef} from 'react';

import CloseButton from '@/closeButton';
import useBodyScrollLock from '@/common/hooks/useBodyScrollLock';
import useEscapeKeyHandler from '@/common/hooks/useEscapeKeyHandler';
import useFocusTrap from '@/common/hooks/useFocusTrap';

import moduleStyles from './customDialog.module.scss';

export interface CustomDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Close button color: 'light' gives a dark X, 'dark' a light one. The panel does not change. */
  mode?: 'light' | 'dark';
  /** Custom class name, applied to the panel (the role="dialog" element) */
  className?: string;
  /** onClose handler. Without it there is no close button and Escape does nothing. A backdrop click never closes. */
  onClose?: () => void;
  /** Close button aria label; defaults to 'Close dialog' */
  closeLabel?: string;
  /** z-index for the overlay, set through --cdo-dialog-z-index; defaults to $zindex-modal-backdrop (1040). 0 is honored. */
  zIndex?: number;
  /** Panel content */
  children?: ReactNode;
}

type PanelProps = HTMLAttributes<HTMLDivElement> & {
  ownerState?: unknown;
  elevation?: unknown;
  as?: unknown;
};

// MUI passes Paper's props to the paper slot; a plain div keeps Paper's emotion styles off the panel.
const DialogPanel = forwardRef<HTMLDivElement, PanelProps>(
  function DialogPanel(props, ref) {
    return (
      <div ref={ref} {...omit(props, ['ownerState', 'elevation', 'as'])} />
    );
  },
);

// ModalManager aria-hides its container's other children; this one has none, so the page stays exposed, as with the legacy dialog.
let detachedContainer: HTMLDivElement | null = null;
const getDetachedContainer = () => {
  if (!detachedContainer) {
    detachedContainer = document.createElement('div');
  }
  return detachedContainer;
};

/**
 * ###  Status: ```Ready for dev```
 *
 * Design System: CustomDialog on MUI `Dialog`, rendered in place (no portal).
 * Scroll lock, Escape and the focus trap come from the DSCO hooks in
 * `src/common/hooks`, not from MUI.
 */
const CustomDialog: React.FunctionComponent<CustomDialogProps> = ({
  mode = 'light',
  className,
  onClose,
  closeLabel = 'Close dialog',
  zIndex,
  children,
  role = 'dialog',
  ['aria-label']: ariaLabel,
  ['aria-labelledby']: ariaLabelledBy,
  ...HTMLAttributes
}) => {
  const panelRef = useRef<HTMLDivElement>(null);

  useBodyScrollLock(true);
  useFocusTrap(panelRef);
  useEscapeKeyHandler(onClose);

  useEffect(() => {
    const hasDescriptionId = panelRef.current?.querySelector(
      '#dsco-dialog-description',
    );
    if (!hasDescriptionId) {
      console.warn(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have an element with" +
          " id='dsco-dialog-description' to provide a description of dialog for screen readers.",
      );
    }
  }, []);

  useEffect(() => {
    if (!ariaLabel && !ariaLabelledBy) {
      console.warn(
        "Warning: CustomDialog component and it's derivatives (Dialog, Modal components) should have" +
          ' an aria-label or aria-labelledby attribute.',
      );
    }
  }, [ariaLabel, ariaLabelledBy]);

  return (
    <MuiDialog
      open
      // Legacy behavior kept on purpose; see Deferred changes in DIALOG_MIGRATION_TO_MUI.md.
      disablePortal
      container={getDetachedContainer}
      disableScrollLock
      disableEscapeKeyDown
      disableAutoFocus
      disableEnforceFocus
      disableRestoreFocus
      transitionDuration={0}
      className={moduleStyles.customDialogOverlay}
      sx={zIndex === undefined ? undefined : {'--cdo-dialog-z-index': zIndex}}
      slots={{paper: DialogPanel}}
      slotProps={{
        paper: {
          ref: panelRef,
          role,
          'aria-label': ariaLabel,
          // An explicit undefined keeps MUI's generated id, which nothing carries, off the panel.
          'aria-labelledby': ariaLabelledBy,
          'aria-describedby': 'dsco-dialog-description',
          className: classnames(moduleStyles.customDialog, className),
          ...HTMLAttributes,
        },
      }}
    >
      {children}

      {onClose && (
        <CloseButton
          aria-label={closeLabel}
          onClick={onClose}
          color={mode === 'light' ? 'dark' : 'light'}
          size="l"
          className={moduleStyles.customDialogCloseButton}
        />
      )}
    </MuiDialog>
  );
};

export default CustomDialog;
