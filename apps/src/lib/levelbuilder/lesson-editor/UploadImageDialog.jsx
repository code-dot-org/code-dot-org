import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/templates/Button';
import i18n from '@cdo/locale';

import LessonEditorDialog from './LessonEditorDialog';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';

export default function UploadImageDialog({
  isOpen,
  handleClose,
  uploadImage,
  allowExpandable = true
}) {
  const [imgUrl, setImgUrl] = useState(undefined);
  const [expandable, setExpandable] = useState(false);
  const [error, setError] = useState(undefined);

  const resetState = () => {
    setImgUrl(undefined);
    setExpandable(false);
    setError(undefined);
  };

  const handleChange = e => {
    resetState();

    // assemble upload data
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    // POST
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch('/level_assets/upload', {
      method: 'post',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfContainer && csrfContainer.content
      }
    })
      .then(response => response.json())
      .then(handleResult)
      .catch(handleError);
  };

  const handleResult = result => {
    if (result && result.newAssetUrl) {
      setImgUrl(result.newAssetUrl);
    } else if (result && result.message) {
      handleError(result.message);
    } else {
      handleError(result);
    }
  };

  const handleError = error => {
    setError(error);
  };

  const handleDialogClose = () => {
    resetState();
    handleClose();
  };

  const handleCloseAndSave = () => {
    if (imgUrl) {
      uploadImage(imgUrl, expandable);
    }

    handleDialogClose();
  };

  return (
    <LessonEditorDialog isOpen={isOpen} handleClose={handleDialogClose}>
      <h2>Upload Image</h2>

      {imgUrl && <img src={imgUrl} />}
      <input type="file" name="file" onChange={handleChange} />

      {error && (
        <div className="alert alert-error" role="alert">
          <span>{error.toString()}</span>
        </div>
      )}

      {allowExpandable && (
        <label style={styles.label}>
          Expandable
          <input
            type="checkbox"
            checked={expandable}
            style={styles.checkbox}
            onChange={e => setExpandable(e.target.checked)}
          />
          <HelpTip>
            <p>
              Check if you want the image to be able to be enlarged in a dialog
              over the page when clicked.
            </p>
          </HelpTip>
        </label>
      )}
      <hr />

      <Button
        text={i18n.closeAndSave()}
        onClick={handleCloseAndSave}
        color={Button.ButtonColor.orange}
        className="save-upload-image-button"
      />
    </LessonEditorDialog>
  );
}

UploadImageDialog.propTypes = {
  allowExpandable: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired
};

const styles = {
  checkbox: {
    margin: '0 0 0 7px'
  },
  label: {
    margin: '10px 0'
  }
};
