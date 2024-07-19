import classnames from 'classnames';
import React, {useState} from 'react';

import Button from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';

import styles from './uploadImage.module.scss';

export default function UploadImageForm() {
  const [imgUrl, setImgUrl] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [formDataForImage, setFormDataForImage] = useState(undefined);
  const [tempImageUrl, setTempImageUrl] = useState(undefined);

  const resetState = () => {
    setImgUrl(undefined);
    setError(undefined);
  };

  const handleChange = e => {
    resetState();
    if (!e.target.files[0]) {
      return;
    }

    // assemble upload data
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setFormDataForImage(formData);
    setTempImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  const saveImageToS3 = () => {
    setIsUploading(true);
    // POST
    const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    fetch('/level_assets/upload', {
      method: 'post',
      body: formDataForImage,
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

  return (
    <div className={styles.topContainer}>
      <h2>{i18n.uploadImage()}</h2>
      {tempImageUrl && (
        <img
          src={tempImageUrl}
          alt="preview of uploaded document"
          className={styles.imagePreview}
        />
      )}
      <div>
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
      </div>
      <hr />
      <div className={styles.contentContainer}>
        <Button
          text={i18n.saveAndViewUrl()}
          onClick={saveImageToS3}
          color={Button.ButtonColor.brandSecondaryDefault}
          className={classnames(styles.saveButton, 'save-upload-image-button')}
          disabled={isUploading}
        />{' '}
        {isUploading && (
          <div className={styles.spinner}>
            <FontAwesome icon="spinner" className="fa-spin" />
          </div>
        )}
        {imgUrl && (
          <div>
            <strong>{i18n.imageURL()}</strong>
            {imgUrl}
          </div>
        )}
      </div>
    </div>
  );
}

UploadImageForm.propTypes = {};
