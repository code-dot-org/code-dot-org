import classnames from 'classnames';
import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import copyToClipboard from '@cdo/apps/util/copyToClipboard';
import i18n from '@cdo/locale';

import UploadImageEditor from './UploadImageEditor';

import styles from './uploadImage.module.scss';

export default function UploadImageForm() {
  const [imgUrls, setImgUrls] = useState([]);
  const [error, setError] = useState(undefined);
  const [isUploading, setIsUploading] = useState(false);
  const [listOfImageFiles, setListOfImageFiles] = useState([]);
  const [tempImageUrls, setTempImageUrls] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [imageToEdit, setImageToEdit] = useState(null);

  const resetState = () => {
    setImgUrls([]);
    setError(undefined);
    setTempImageUrls([]);
  };

  const handleChange = e => {
    resetState();
    if (!e.target.files[0]) {
      return;
    }

    // assemble upload data
    let tempImageFileList = [];
    let tempImageUrlList = [];
    for (let i = 0; i < e.target.files.length; i++) {
      tempImageFileList.push(e.target.files[i]);
      tempImageUrlList.push(URL.createObjectURL(e.target.files[i]));
    }
    setListOfImageFiles(tempImageFileList);
    setTempImageUrls(tempImageUrlList);
  };

  const saveImageToS3 = formData => {
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
    for (const image of listOfImageFiles) {
      const singleFormData = new FormData();
      singleFormData.append('file', image);
      saveImageToS3(singleFormData);
    }
  };

  const handleResult = result => {
    if (result && result.newAssetUrl) {
      setImgUrls(prevUrls => [...prevUrls, result.newAssetUrl]);
    } else if (result && result.message) {
      setError(result.message);
    } else {
      setError(result);
    }
    setIsUploading(false);
  };

  const handleCopy = text => {
    copyToClipboard(
      text,
      () => alert('Text copied to clipboard'),
      () => {
        console.error('Error in copying text');
      }
    );
  };

  const openEditor = imageUrl => {
    setImageToEdit(imageUrl);
    setIsEditing(true);
  };

  const saveEditedImage = (editedImageUrl, editedImageFile) => {
    // Update the list of image files
    setListOfImageFiles(prevFiles =>
      prevFiles.map((file, index) =>
        tempImageUrls[index] === imageToEdit ? editedImageFile : file
      )
    );

    // Update the temporary image URLs
    setTempImageUrls(prevUrls =>
      prevUrls.map(url => (url === imageToEdit ? editedImageUrl : url))
    );

    closeEditor();
  };

  const closeEditor = () => {
    setIsEditing(false);
    setImageToEdit(null);
  };

  return (
    <div className={styles.topContainer}>
      <h2>{i18n.uploadImages()}</h2>
      {tempImageUrls && tempImageUrls.length > 0 && (
        <div className={styles.imageGrid}>
          {tempImageUrls.map((url, index) => (
            <img
              key={index}
              src={url}
              alt={`Preview ${index + 1}`}
              className={styles.imagePreview}
              onClick={() => openEditor(url)}
            />
          ))}
        </div>
      )}
      {isEditing && (
        <div>
          <UploadImageEditor
            imageUrl={imageToEdit}
            onSave={saveEditedImage}
            onCancel={closeEditor}
          />
        </div>
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
        {imgUrls && imgUrls.length > 0 && (
          <div>
            {imgUrls.map((url, index) => (
              <div className={styles.tableContainer} key={index}>
                <div className={styles.imageContainer}>
                  <img src={url} alt={`Uploaded file ${index + 1}`} />
                </div>
                <div>
                  <strong>{i18n.imageURL()}</strong>
                  {url}
                </div>
                <Button
                  color={Button.ButtonColor.white}
                  icon={'clipboard'}
                  key="copy"
                  onClick={() => handleCopy(url)}
                  size={Button.ButtonSize.small}
                  text="Copy Image URL"
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

UploadImageForm.propTypes = {};
