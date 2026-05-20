import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Props accepted by the lab's shared <Button>. */
interface ButtonProps {
  /** Additional class names composed onto `.ocean-button`. */
  className?: string;
  /**
   * Escape hatch for inline CSS custom properties (e.g. dynamic
   * percentages set as `--ocean-bar-width`).  Static visual styling
   * lives in CSS classes; this is only for genuinely per-render values.
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
      <button
        type="button"
        id={this.props.id}
        className={className}
        style={this.props.style}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

export default Button;
