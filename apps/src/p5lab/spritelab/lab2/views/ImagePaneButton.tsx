import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './image-details-dialog.module.scss';

interface ImagePaneButtonProps {
  /** Current pixels; a blank placeholder when absent. */
  thumb?: string;
  /** Pixel art upscales with hard edges; smooth art keeps its shading. */
  pixelated?: boolean;
  /** Corner-chip icon. */
  iconName: string;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}

/**
 * The image dialog's pane as a button into the paint editor: the whole area
 * is the target, with a corner chip that lights up on hover and focus.
 */
const ImagePaneButton: React.FunctionComponent<ImagePaneButtonProps> = ({
  thumb,
  pixelated,
  iconName,
  label,
  disabled,
  onClick,
}) => (
  <button
    type="button"
    className={classNames(
      moduleStyles.imagePane,
      moduleStyles.imageButton,
      thumb && moduleStyles.imagePaneChecker
    )}
    aria-label={label}
    disabled={disabled}
    onClick={onClick}
  >
    {thumb ? (
      <img
        src={thumb}
        alt=""
        className={classNames(pixelated && moduleStyles.pixelArt)}
      />
    ) : (
      <div className={moduleStyles.imagePlaceholder} aria-hidden />
    )}
    <span className={moduleStyles.paintOverlay} aria-hidden>
      <FontAwesomeV6Icon iconName={iconName} />
    </span>
  </button>
);

export default ImagePaneButton;
