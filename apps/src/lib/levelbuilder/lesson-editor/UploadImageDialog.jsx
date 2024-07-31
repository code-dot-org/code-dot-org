import PropTypes from 'prop-types';
import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import HelpTip from '@cdo/apps/lib/ui/HelpTip';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';

import LessonEditorDialog from './LessonEditorDialog';

export default function UploadImageDialog({
  isOpen,
  handleClose,
  uploadImage,
  allowExpandable = true,
}) {
  const [imgUrl, setImgUrl] = useState(undefined);
  const [expandable, setExpandable] = useState(false);
  const [error, setError] = useState(undefined);
  const [isUploading, setIsUploading] = useState(false);

  const resetState = () => {
    setImgUrl(undefined);
    setExpandable(false);
    setError(undefined);
  };

  const handleChange = e => {
    if (!e.target.files[0]) {
      resetState();
      return;
    }
    resetState();
    setIsUploading(true);

    // assemble upload data
    const formData = new FormData();
    formData.append('file', e.target.files[0]);

    // POST
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch('/level_assets/upload', {
      method: 'post',
      body: formData,
      headers: {
        'X-CSRF-Token': csrfContainer && csrfContainer.content,
      },
    })
      .then(response => response.json())
      .then(handleResult)
      .catch(err => {
        setError(err);
        setIsUploading(false);
      });
  };

  const handleResult = result => {
    if (result && result.newAssetUrl) {
      setImgUrl(result.newAssetUrl);
    } else if (result && result.message) {
      setError(result.message);
    } else {
      setError(result);
    }
    setIsUploading(false);
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
      {
        // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
        // Verify or update this alt-text as necessary
      }
      {imgUrl && <img src={imgUrl} alt="" />}
      <input
        type="file"
        name="file"
        onChange={handleChange}
        disabled={isUploading}
      />

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
      <div style={{display: 'flex'}}>
        <Button
          text={i18n.closeAndSave()}
          onClick={handleCloseAndSave}
          color={Button.ButtonColor.brandSecondaryDefault}
          className="save-upload-image-button"
          disabled={isUploading}
        />{' '}
        {isUploading && (
          <div style={styles.spinner}>
            <FontAwesome icon="spinner" className="fa-spin" />
          </div>
        )}
      </div>
    </LessonEditorDialog>
  );
}

UploadImageDialog.propTypes = {
  allowExpandable: PropTypes.bool,
  isOpen: PropTypes.bool.isRequired,
  handleClose: PropTypes.func.isRequired,
  uploadImage: PropTypes.func.isRequired,
};

const styles = {
  checkbox: {
    margin: '0 0 0 7px',
  },
  label: {
    margin: '10px 0',
  },
  spinner: {
    fontSize: 25,
    padding: 10,
  },
};
