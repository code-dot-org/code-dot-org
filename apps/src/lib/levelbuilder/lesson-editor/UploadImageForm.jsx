import React, {useState} from 'react';

import Button from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';
import styles from './uploadImage.module.scss';
import classnames from 'classnames';

export default function UploadImageForm() {
  const [imgUrl, setImgUrl] = useState(undefined);
  const [error, setError] = useState(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [formDataForImages, setFormDataForImages] = useState(undefined);
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
    for (let i = 0; i < e.target.files.length; i++) {
      formData.append('file', e.target.files[i]);
      console.log('Form data: ');
      console.log(formData.get('file0'));
    }
    setFormDataForImages(formData);
    console.log(formData);
    setTempImageUrl(URL.createObjectURL(e.target.files[0]));
  };

  // NEXT STEP: Test on an account that has AWS access
  const saveImageToS3 = formData => {
    console.log('Saving image to S3');
    setIsUploading(true);
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

  const saveImagesToS3 = () => {
    console.log('Saving images to S3');
    for (const image of formDataForImages.entries()) {
      const singleFormData = new FormData();
      singleFormData.append(image[0], image[1]);
      saveImageToS3(singleFormData);
    }
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
          multiple
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
          onClick={saveImagesToS3}
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
