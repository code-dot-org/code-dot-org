import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import moduleStyles from './photo-selection-view.module.scss';

const photoInputId = 'photoInput';

/**
 * Renders a component with a camera icon and optional prompt text
 * which allows a user to select and upload a photo when clicking the icon.
 */
export default function PhotoSelectionView({
  promptText,
  onPhotoSelected,
  style,
}) {
  const onInputChange = event => {
    onPhotoSelected(event.target.files[0]);
  };

  return (
    <label
      htmlFor={photoInputId}
      className={moduleStyles.container}
      style={style}
    >
      <input
        id={photoInputId}
        className={classNames('uitest-hidden-uploader')}
        type="file"
        accept="image/*"
        capture="camera"
        onChange={onInputChange}
      />
      <FontAwesomeV6Icon iconName="camera" className={moduleStyles.camera} />
      <div className={moduleStyles.prompt}>{promptText}</div>
    </label>
  );
}

PhotoSelectionView.propTypes = {
  /**
   * Required. Called when a photo has been selected.
   * The file object representing the chosen file is
   * passed to this function.
   */
  onPhotoSelected: PropTypes.func.isRequired,
  /** Optional. Displays prompt text below the icon. */
  promptText: PropTypes.string,
  /** Optional. Additional styles to apply to the component */
  style: PropTypes.object,
};
