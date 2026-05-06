import Radium from 'radium';
import React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import styles from '@/oceans/styles';

interface ButtonProps {
  className?: string;
  style?: React.CSSProperties | (React.CSSProperties | undefined)[];
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
  id?: string;
}

const UnwrappedButton = class Button extends React.Component<ButtonProps> {
  onClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    guide.dismissCurrentGuide();
    const clickReturnValue = this.props.onClick?.(event);

    if (clickReturnValue !== false) {
      const sound = this.props.sound || 'other';
      soundLibrary.playSound(sound);
    }
  };

  render() {
    return (
      <button
        type="button"
        id={this.props.id}
        className={this.props.className}
        style={
          [styles.button, this.props.style] as unknown as React.CSSProperties
        }
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};

export default Radium(UnwrappedButton);
