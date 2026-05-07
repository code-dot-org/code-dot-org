import Radium from 'radium';
import * as React from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import styles from '@/oceans/styles';
import {mergeStyles} from '@/oceans/styles/mergeStyles';

interface ButtonProps {
  className?: string;
  /** Single style or array of styles (Radium merges arrays at runtime). */
  style?:
    | React.CSSProperties
    | ReadonlyArray<React.CSSProperties | false | null | undefined>;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => boolean | void;
  sound?: string;
  id?: string;
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
    const propStyle = this.props.style;
    const propStyles: Array<React.CSSProperties | false | null | undefined> =
      Array.isArray(propStyle) ? [...propStyle] : [propStyle];
    const style = mergeStyles(styles.button, ...propStyles);
    return (
      <button
        type="button"
        id={this.props.id}
        className={this.props.className}
        style={style}
        onClick={this.onClick}
      >
        {this.props.children}
      </button>
    );
  }
};

export default Radium(UnwrappedButton);
