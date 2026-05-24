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
    'autoFocus' | 'id' | 'children' | 'aria-label'
  > {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
  /** MUI sx overrides forwarded directly to MuiButton. */
  sx?: MuiButtonProps['sx'];
  /** Marks this button as the preferred focus target after a modal guide is dismissed. */
  guideDismissFocus?: boolean;
  /** Test hook forwarded as `data-testid`. */
  testId?: string;
  /** Forwarded as `className` for per-scene styling overrides. */
  className?: string;
}

/** Shared button: dismisses any active guide and plays the configured sound unless the click handler returns false. */
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
    const {
      autoFocus,
      id,
      children,
      sx,
      guideDismissFocus,
      testId,
      className,
      'aria-label': ariaLabel,
    } = this.props;
    return (
      <MuiButton
        type="button"
        // eslint-disable-next-line jsx-a11y/no-autofocus -- justification at call site
        autoFocus={autoFocus}
        id={id}
        aria-label={ariaLabel}
        className={className}
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
