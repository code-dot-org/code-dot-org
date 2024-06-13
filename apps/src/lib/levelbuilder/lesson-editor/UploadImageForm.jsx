import React, {useState} from 'react';

import Button from '@cdo/apps/templates/Button';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import i18n from '@cdo/locale';

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
    if (!e.target.files[0]) {
      resetState();
      return;
    }
    resetState();
    setIsUploading(true);

    // assemble upload data
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    setFormDataForImage(formData);
    setIsUploading(false);
    setTempImageUrl(URL.createObjectURL(e.target.files[0]));

    // // POST
    // const csrfContainer = document.querySelector('meta[name="csrf-token"]');
    // fetch('/level_assets/upload', {
    //   method: 'post',
    //   body: formData,
    //   headers: {
    //     'X-CSRF-Token': csrfContainer && csrfContainer.content,
    //   },
    // })
    //   .then(response => response.json())
    //   .then(handleResult)
    //   .catch(err => {
    //     setError(err);
    //     setIsUploading(false);
    //   });
  };

  const saveImageToS3 = () => {
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
    <>
      <h2>Upload Image</h2>
      {
        // TODO: A11y279 (https://codedotorg.atlassian.net/browse/A11Y-279)
        // Verify or update this alt-text as necessary
      }
      {tempImageUrl && (
        <img src={tempImageUrl} alt="" style={{width: '100px'}} />
      )}
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
      <hr />
      <div style={{display: 'flex'}}>
        <Button
          text={i18n.closeAndSave()}
          onClick={saveImageToS3}
          color={Button.ButtonColor.brandSecondaryDefault}
          className="save-upload-image-button"
          disabled={isUploading}
        />{' '}
        {isUploading && (
          <div style={styles.spinner}>
            <FontAwesome icon="spinner" className="fa-spin" />
          </div>
        )}
        {imgUrl && <div>{imgUrl}</div>}
      </div>
    </>
  );
}

UploadImageForm.propTypes = {};

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
