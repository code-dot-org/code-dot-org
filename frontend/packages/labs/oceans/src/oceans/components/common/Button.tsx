import {
  Button as MuiButton,
  type ButtonProps as MuiButtonProps,
} from '@mui/material';
import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Props accepted by the lab's shared <Button>. */
interface ButtonProps
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'autoFocus' | 'id' | 'children'
  > {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
  /** MUI sx overrides forwarded directly to MuiButton. */
  sx?: MuiButtonProps['sx'];
  /** Marks this button as the preferred focus target after a modal guide is dismissed. */
  guideDismissFocus?: boolean;
  /** Forwarded as data-testid for Playwright locators. */
  testId?: string;
}

/**
 * Shared button used across scenes.  Wraps MUI Button to stay idiomatic with
 * the design system while preserving the lab-specific side effects: dismiss
 * any active guide and play the configured sound unless the click handler
 * returns `false`.
 *
 * Visual styling is intentionally ocean-specific (white bg, grey text, 8 px
 * radius, em-based padding) via sx — the CdoTheme defaults are overridden here
 * because the oceans lab has its own visual language.
 */
class Button extends React.Component<ButtonProps> {
  onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick && this.props.onClick(event);

    if (clickReturnValue !== false) {
      const sound = this.props.sound || 'other';
      soundLibrary.playSound(sound);
    }
  };

  render() {
    const {autoFocus, id, children, sx, guideDismissFocus, testId} = this.props;
    return (
      <MuiButton
        type="button"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- forwarded from caller; justification lives at the call site
        autoFocus={autoFocus}
        id={id}
        data-testid={testId}
        onClick={this.onClick}
        disableRipple
        data-guide-dismiss-focus={guideDismissFocus || undefined}
        sx={[
          {
            display: 'inline-block',
            cursor: 'pointer',
            backgroundColor: 'var(--ocean-color-white)',
            color: 'var(--ocean-color-grey)',
            fontSize: '100%',
            padding: '0.75em 1.5em',
            borderRadius: '8px',
            minWidth: '15%',
            border: 'none',
            whiteSpace: 'nowrap',
            lineHeight: 1.3,
            fontWeight: 'normal',
            textTransform: 'none',
            letterSpacing: 'normal',
            fontFamily: 'inherit',
            '&:hover': {
              backgroundColor: 'var(--ocean-color-white)',
            },
          },
          ...(Array.isArray(sx) ? sx : sx ? [sx] : []),
        ]}
      >
        {children}
      </MuiButton>
    );
  }
}

export default Button;
