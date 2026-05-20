import ButtonBase from '@mui/material/ButtonBase';
import {styled} from '@mui/material/styles';
import type {SxProps, Theme} from '@mui/material/styles';
import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Base ocean button element: ButtonBase with ocean visual defaults baked in. */
const OceanButton = styled(ButtonBase)({
  cursor: 'pointer',
  backgroundColor: 'var(--ocean-color-white)',
  color: 'var(--ocean-color-grey)',
  fontSize: '100%',
  /* em-based padding scales with font-size regardless of consumer context. */
  padding: '0.75em 1.5em',
  borderRadius: '8px',
  minWidth: '15%',
  border: 'none',
  whiteSpace: 'nowrap',
  lineHeight: 1.3,
});

/** Props accepted by the lab's shared Button. */
interface ButtonProps {
  /**
   * Visual modifier styles — position overrides, background colour, hover
   * states, etc.  Test-hook classes (e.g. `dialog-button`, `words-button`)
   * go in `className`.
   */
  sx?: SxProps<Theme>;
  /**
   * Escape hatch for inline CSS custom properties (e.g. `--ocean-bar-width`).
   * Static visual styling lives in `sx`; only genuinely per-render computed
   * values belong here.
   */
  style?: React.CSSProperties;
  /** Test-hook-only class names. Visual modifiers belong in `sx`. */
  className?: string;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
  id?: string;
}

/**
 * Shared button used across scenes.  Dismisses any active guide and plays
 * the configured sound (`sound` prop, default `'other'`) unless the click
 * handler explicitly returns `false`.
 *
 * Implemented as a `styled(ButtonBase)` so all visual styles live in MUI's
 * sx system while `ButtonBase` handles keyboard activation and accessibility.
 */
class Button extends React.Component<ButtonProps> {
  onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick && this.props.onClick(event);

    if (clickReturnValue !== false) {
      soundLibrary.playSound(this.props.sound || 'other');
    }
  };

  render() {
    return (
      <OceanButton
        disableRipple
        id={this.props.id}
        className={this.props.className}
        sx={this.props.sx}
        style={this.props.style}
        onClick={this.onClick as React.MouseEventHandler<HTMLElement>}
      >
        {this.props.children}
      </OceanButton>
    );
  }
}

export default Button;
