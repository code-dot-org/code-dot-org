import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Button from '@cdo/apps/templates/Button';
import StylizedBaseDialog from '@cdo/apps/componentLibrary/StylizedBaseDialog';
import UploadImageDialog from '@cdo/apps/lib/levelbuilder/lesson-editor/UploadImageDialog';

export default function ImageInput({updateImageUrl, imageUrl}) {
  const [removeImageDialogOpen, setRemoveImageDialogOpen] = useState(false);
  const [uploadImageDialogOpen, setUploadImageDialogOpen] = useState(false);
  return (
    <div>
      <label>
        Image
        <Button
          onClick={() => setUploadImageDialogOpen(true)}
          text={!!imageUrl ? 'Replace Image' : 'Choose Image'}
          color="gray"
          icon="plus-circle"
        />
        {imageUrl && <span>{imageUrl}</span>}
        {imageUrl && (
          <Button
            text="Remove Image"
            color="red"
            icon="trash"
            onClick={() => setRemoveImageDialogOpen(true)}
          />
        )}
      </label>
      {removeImageDialogOpen && (
        <StylizedBaseDialog
          body="Are you sure you want to remove this image?"
          handleConfirmation={() => {
            updateImageUrl(null);
            setRemoveImageDialogOpen(false);
          }}
          handleClose={() => setRemoveImageDialogOpen(false)}
          isOpen
        />
      )}
      <UploadImageDialog
        isOpen={uploadImageDialogOpen}
        handleClose={() => setUploadImageDialogOpen(false)}
        uploadImage={imgUrl => updateImageUrl(imgUrl)}
        allowExpandable={false}
      />
    </div>
  );
}

ImageInput.propTypes = {
  updateImageUrl: PropTypes.func.isRequired,
  imageUrl: PropTypes.string
};
