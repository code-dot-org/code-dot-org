import PropTypes from 'prop-types';
import React from 'react';

import color from '@cdo/apps/util/color';

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
    <div style={{...styles.container, ...style}}>
      <label
        htmlFor={photoInputId}
        className="fa fa-camera"
        style={styles.label}
      >
        <input
          id={photoInputId}
          className="uitest-hidden-uploader"
          type="file"
          accept="image/*"
          capture="camera"
          hidden={true}
          onChange={onInputChange}
        />
      </label>
      <div style={styles.prompt}>{promptText}</div>
    </div>
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

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: color.black,
  },
  label: {
    fontSize: 48,
  },
  prompt: {
    textColor: color.white,
  },
};
