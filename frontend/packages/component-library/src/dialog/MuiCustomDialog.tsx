import {Dialog, IconButton} from '@mui/material';
import classNames from 'classnames';
import {HTMLAttributes, ReactNode, useCallback, useEffect, useRef} from 'react';

import {useTheme} from '@/common/contexts';
import type {Theme as DataThemeMode} from '@/common/contexts';
import FontAwesomeV6Icon from '@/fontAwesomeV6Icon';

import moduleStyles from './muiCustomDialog.module.scss';

/**
 * The id the dialog points `aria-describedby` at. Consumers put it on the
 * element that describes the dialog; Dialog's `description` carries it.
 */
export const DIALOG_DESCRIPTION_ID = 'dsco-dialog-description';

// What useFocusTrap treated as focusable, minus disabled controls.
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input:not([disabled]), ' +
  'textarea:not([disabled]), select:not([disabled]), ' +
  '[tabindex]:not([tabindex="-1"])';

export interface MuiCustomDialogProps extends HTMLAttributes<HTMLDivElement> {
  /** Color of the close X only; the panel follows `data-theme`. */
  mode?: 'light' | 'dark';
  /** Class name for the dialog panel (MUI Paper), where widths and layouts go. */
  className?: string;
  /**
   * Called from the close X and the Escape key. Clicking the backdrop never
   * closes. With no handler, neither renders nor does anything.
   */
  onClose?: () => void;
  /** Accessible name of the close X. */
  closeLabel?: string;
  /** z-index of the overlay. Defaults to the theme's 1040 (variables.scss). */
  zIndex?: number;
  /** Dialog content. */
  children?: ReactNode;
  /**
   * Theme of the panel. The panel renders in a portal on `document.body`,
   * outside any ancestor `[data-theme]`; defaults to the theme of the
   * enclosing DSCO `ThemeProvider` when there is one.
   */
  'data-theme'?: DataThemeMode;
}

/**
 * ## Production-ready Checklist:
 *  * (✔) implementation of component approved by design team;
 *  * (✔) has storybook, covered with stories and documentation;
 *  * (✔) has tests: test every prop, every state and every interaction that's js related;
 *  * (see ./__tests__/MuiCustomDialog.test.tsx)
 *  * (?) passes accessibility checks;
 *
 * ###  Status: ```Ready for dev```
 *
 * Design System: CustomDialog on MUI `Dialog`.
 * A bare modal panel with a close X: the `MuiDialog` theme entry paints the
 * surface and backdrop, MUI's Modal supplies the focus trap, scroll lock and
 * Escape handling. Mounted means open; consumers render it conditionally, the
 * way they render the legacy CustomDialog. Every other HTML attribute lands on
 * the panel, so `role`, `aria-*`, `id` and `style` overrides keep working.
 */
const MuiCustomDialog: React.FunctionComponent<MuiCustomDialogProps> = ({
  mode = 'light',
  className,
  onClose,
  closeLabel = 'Close dialog',
  zIndex,
  children,
  role = 'dialog',
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  'aria-describedby': ariaDescribedBy = DIALOG_DESCRIPTION_ID,
  'data-theme': dataTheme,
  ...HTMLAttributes
}) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const {theme: contextTheme} = useTheme(true);

  useEffect(() => {
    const hasDescriptionId = paperRef.current?.querySelector(
      `#${DIALOG_DESCRIPTION_ID}`,
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

  // MUI reports the reason; DSCO dialogs never close on a backdrop click.
  const handleClose = useCallback(
    (_event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
      if (reason !== 'backdropClick') {
        onClose?.();
      }
    },
    [onClose],
  );

  // MUI's FocusTrap focuses its tabIndex=-1 container; DSCO focused the first
  // control, which is what screen readers announce. onEntered fires after the
  // trap settles (autoFocus races it, mui#33004).
  const focusFirstControl = useCallback(() => {
    paperRef.current?.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
  }, []);

  return (
    <Dialog
      open
      onClose={onClose && handleClose}
      disableEscapeKeyDown={!onClose}
      sx={zIndex === undefined ? undefined : {zIndex}}
      slotProps={{
        transition: {onEntered: focusFirstControl},
        paper: {
          ref: paperRef,
          role,
          'aria-label': ariaLabel,
          // MUI generates an id here when none is given; drop it so a dialog
          // named by aria-label does not also point at a missing element.
          'aria-labelledby': ariaLabelledBy,
          'aria-describedby': ariaDescribedBy,
          'data-theme': dataTheme ?? contextTheme,
          className: classNames(moduleStyles.customDialog, className),
          ...HTMLAttributes,
        },
      }}
    >
      {children}

      {onClose && (
        <IconButton
          aria-label={closeLabel}
          onClick={onClose}
          className={classNames(
            moduleStyles.customDialogCloseButton,
            mode === 'light'
              ? moduleStyles.customDialogCloseButtonOnLight
              : moduleStyles.customDialogCloseButtonOnDark,
          )}
        >
          <FontAwesomeV6Icon iconName="xmark" aria-hidden="true" />
        </IconButton>
      )}
    </Dialog>
  );
};

export default MuiCustomDialog;
