import Radium from 'radium';
import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import styles from '@/oceans/styles';

interface ButtonProps {
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
}

const UnwrappedButton = class Button extends React.Component<ButtonProps> {
  onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick && this.props.onClick(event);

    if (clickReturnValue !== false) {
      const sound = this.props.sound || 'other';
      soundLibrary.playSound(sound);
    }
  };

  render() {
    return (
      <button
        type="button"
        className={this.props.className}
        style={[styles.button, this.props.style]}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};

export default Radium(UnwrappedButton);
