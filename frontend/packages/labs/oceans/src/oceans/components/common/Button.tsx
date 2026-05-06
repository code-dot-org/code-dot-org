import Radium from 'radium';
import {
  Component,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react';

import guide from '@/oceans/models/guide';
import soundLibrary from '@/oceans/models/soundLibrary';
import styles from '@/oceans/styles';

/** Props for the Button component. */
interface ButtonProps {
  className?: string;
  style?: CSSProperties | (CSSProperties | undefined)[];
  children?: ReactNode;
  /** Return `false` to suppress the post-click sound. */
  onClick?: (event: MouseEvent<HTMLButtonElement>) => boolean | void;
  /** Sound category to play on click; defaults to `'other'`. */
  sound?: string;
  id?: string;
}

/** Styled button that dismisses the current guide and plays a sound on click. */
const UnwrappedButton = class Button extends Component<ButtonProps> {
  onClick = (event: MouseEvent<HTMLButtonElement>) => {
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
