import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';

/** Props accepted by the lab's shared <Button>. */
interface ButtonProps
  extends Pick<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    'className' | 'style' | 'id' | 'children'
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
