import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';
import color from '@cdo/apps/util/color';

export default function ImageInput({
  updateImageUrl,
  initialImageUrl,
  showPreview = false
}) {
  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);

  const [currentImageUrl, setCurrentImageUrl] = useState(initialImageUrl);

  const onImageUrlChange = newImageUrl => {
    setCurrentImageUrl(newImageUrl);
    updateImageUrl(newImageUrl);
  };

  return (
    <div>
      <div style={{display: 'flex'}}>
        <label>
          Image
          <input
            type="text"
            onChange={e => onImageUrlChange(e.target.value)}
            value={currentImageUrl}
            style={{width: 350, margin: 5}}
          />
          <Button
            onClick={e => {
              e.preventDefault();
              setUploadImageDialogOpen(true);
            }}
            text={!!currentImageUrl ? 'Replace Image' : 'Choose Image'}
            color="gray"
            icon="plus-circle"
          />
        </label>
        {showPreview && !!currentImageUrl && (
          <img src={currentImageUrl} style={styles.image} />
        )}
      </div>
      <UploadImageDialog
        isOpen={uploadImageDialogOpen}
        handleClose={() => setUploadImageDialogOpen(false)}
        uploadImage={imgUrl => onImageUrlChange(imgUrl)}
        allowExpandable={false}
      />
    </div>
  );
}

ImageInput.propTypes = {
  updateImageUrl: PropTypes.func.isRequired,
  initialImageUrl: PropTypes.string,
  showPreview: PropTypes.bool
};

const styles = {
  image: {
    width: 100,
    marginLeft: 5,
    borderStyle: 'solid',
    borderWidth: 1,
    borderColor: color.lighter_gray
  }
};
