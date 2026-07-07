import Toast, {
  DEFAULT_TOAST_DURATION,
  ToastType,
} from '@code-dot-org/component-library/toast';
import React, {FC, useState} from 'react';

type FlashType = 'notice' | 'alert';

type FlashMessage = string | string[];

export type Flash = [FlashType, FlashMessage][];

/**
 * Renders a Rails flash as a design system {@link Toast} (top-center, 6s
 * auto-dismiss). Thin adapter over the component-library Toast: it maps the
 * Rails flash shape to a message/type and owns the open state.
 */
export const FlashHandler: FC<{
  flash?: Flash;
  autoHideDuration?: number;
  onClose?: () => void;
}> = ({flash, autoHideDuration = DEFAULT_TOAST_DURATION, onClose}) => {
  // Track the flash that was dismissed rather than a plain boolean, so a new
  // `flash` value reopens the toast on an already-mounted instance.
  const [dismissed, setDismissed] = useState<Flash | undefined>(undefined);

  if (!flash?.length) {
    return null;
  }

  const open = flash !== dismissed;

  const handleClose = () => {
    setDismissed(flash);
    onClose?.();
  };

  // rails flash could contain multiple flash types and multiple messages per type
  // presently only supporting the first type and message
  const [type, message] = flash[0];
  const text = Array.isArray(message) ? message[0] : message;

  return (
    <Toast
      open={open}
      message={text}
      type={getToastType(type)}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    />
  );
};

const getToastType = (flashType: FlashType): ToastType => {
  switch (flashType) {
    case 'alert':
      return 'danger';
    case 'notice':
      return 'success';
    default:
      return 'primary';
  }
};
