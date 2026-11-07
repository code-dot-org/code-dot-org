import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Props accepted by the lab's shared <Button>. */
interface ButtonProps
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'style' | 'id' | 'children' | 'disabled'
  > {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
}

/**
 * Shared button used across scenes.  Dismisses any active guide and plays
 * the configured sound (`sound` prop, default `'other'`) unless the click
 * handler explicitly returns `false`.
 */
class Button extends React.Component<ButtonProps> {
  onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (this.props.disabled) {
      return;
    }
    const currentGuide = guide.getCurrentGuide();
    if (currentGuide?.noDimBackground) {
      // Guides that point at a button close when it's pressed, even if their
      // text is still typing; otherwise they stay up and block later guides.
      guide.dismissGuide(currentGuide.id);
    } else {
      guide.dismissCurrentGuide();
    }
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
        // aria-disabled rather than `disabled`: a natively disabled button
        // drops keyboard focus, so a keyboard user would have to tab back
        // after every answer.
        aria-disabled={this.props.disabled || undefined}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
}

export default Button;
