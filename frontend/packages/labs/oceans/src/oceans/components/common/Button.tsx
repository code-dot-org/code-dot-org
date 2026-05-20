import Box from '@mui/material/Box';
import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Props accepted by the lab's shared Button. */
interface ButtonProps {
  /** Class names composed onto `.ocean-button`.  Visual modifiers (e.g.
   * `ocean-button--continue`) and test-hook classes (e.g. `dialog-button`,
   * `words-button`) are both passed here. */
  className?: string;
  /**
   * Escape hatch for inline CSS custom properties (e.g. `--ocean-bar-width`).
   * Static visual styling lives in CSS classes; only genuinely per-render
   * computed values belong here.
   */
  style?: React.CSSProperties;
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
 * Implemented as MUI `Box component="button"` so it participates in the MUI
 * theme context while the visual styling stays entirely in `scenes.css` via
 * className — avoiding Emotion/CSS specificity conflicts.
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
    const className = this.props.className
      ? `ocean-button ${this.props.className}`
      : 'ocean-button';
    return (
      <Box
        component="button"
        type="button"
        id={this.props.id}
        className={className}
        style={this.props.style}
        onClick={this.onClick as React.MouseEventHandler<HTMLElement>}
      >
        {this.props.children}
      </Box>
    );
  }
}

export default Button;
