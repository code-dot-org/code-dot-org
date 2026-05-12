import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import classNames from 'classnames';
import React, {useState} from 'react';

import Button from '@cdo/apps/legacySharedComponents/Button';
import ImageInput from '@cdo/apps/levelbuilder/ImageInput';
import {
  DEFAULT_PANEL_IMAGE_WIDTH,
  DEFAULT_PANEL_IMAGE_X,
  DEFAULT_PANEL_IMAGE_Y,
  Panel,
  PanelImage,
} from '@cdo/apps/panels/types';

import {PANEL_HEIGHT, PANEL_WIDTH} from './constants';

import moduleStyles from './edit-panels.module.scss';

interface EditPanelsImagesProps {
  panel: Panel;
  updatePanel: (panel: Panel) => void;
}

const getImageEditorKey = (image: PanelImage, imageIndex: number) =>
  [
    image.imageUrl,
    image.altText || '',
    image.x,
    image.y,
    image.width || '',
    imageIndex,
  ].join('-');

// Editor for image overlays on link-mode panels. Images are centered at x/y
// percentages and scaled by width percentage while preserving aspect ratio.
const EditPanelsImages: React.FunctionComponent<EditPanelsImagesProps> = ({
  panel,
  updatePanel,
}) => {
  const images = panel.images || [];
  const [draggedImageIndex, setDraggedImageIndex] = useState<number | null>(
    null
  );

  const updateImage = (imageIndex: number, newImage: PanelImage) => {
    const newImages = [...images];
    newImages[imageIndex] = newImage;
    updatePanel({...panel, images: newImages});
  };

  const addImage = () => {
    const newImage: PanelImage = {
      imageUrl: '',
      x: DEFAULT_PANEL_IMAGE_X,
      y: DEFAULT_PANEL_IMAGE_Y,
      width: DEFAULT_PANEL_IMAGE_WIDTH,
    };
    updatePanel({...panel, images: [...images, newImage]});
  };

  const deleteImage = (imageIndex: number) => {
    const newImages = images.filter((_, i) => i !== imageIndex);
    updatePanel({
      ...panel,
      images: newImages.length > 0 ? newImages : undefined,
    });
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    if (
      fromIndex === toIndex ||
      fromIndex < 0 ||
      toIndex < 0 ||
      fromIndex >= images.length ||
      toIndex >= images.length
    ) {
      return;
    }

    const newImages = [...images];
    const [image] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, image);
    updatePanel({...panel, images: newImages});
  };

  const handleDragStart = (
    event: React.DragEvent<HTMLButtonElement>,
    imageIndex: number
  ) => {
    setDraggedImageIndex(imageIndex);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/plain', imageIndex.toString());
  };

  const getDroppedImageIndex = (event: React.DragEvent<HTMLDivElement>) => {
    if (draggedImageIndex !== null) {
      return draggedImageIndex;
    }

    const rawDataTransferIndex = event.dataTransfer.getData('text/plain');
    if (!rawDataTransferIndex) {
      return null;
    }

    const dataTransferIndex = Number(rawDataTransferIndex);
    return Number.isInteger(dataTransferIndex) ? dataTransferIndex : null;
  };

  const handleDrop = (
    event: React.DragEvent<HTMLDivElement>,
    imageIndex: number
  ) => {
    event.preventDefault();
    const sourceImageIndex = getDroppedImageIndex(event);
    if (sourceImageIndex !== null) {
      moveImage(sourceImageIndex, imageIndex);
    }
    setDraggedImageIndex(null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnd = () => {
    setDraggedImageIndex(null);
  };

  const handleDragHandleKeyDown = (
    event: React.KeyboardEvent<HTMLButtonElement>,
    imageIndex: number
  ) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      moveImage(imageIndex, imageIndex - 1);
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      moveImage(imageIndex, imageIndex + 1);
    }
  };

  return (
    <div className={moduleStyles.imagesSection}>
      <Typography variant="h6" gutterBottom>
        Images
      </Typography>
      {images.map((image, imageIndex) => (
        <div
          key={getImageEditorKey(image, imageIndex)}
          className={classNames(
            moduleStyles.fieldRow,
            moduleStyles.imageRow,
            draggedImageIndex === imageIndex && moduleStyles.imageRowDragging
          )}
          role="group"
          aria-label={`Image ${imageIndex + 1} settings`}
          onDragOver={handleDragOver}
          onDrop={event => handleDrop(event, imageIndex)}
        >
          <button
            type="button"
            className={moduleStyles.imageDragHandle}
            draggable
            aria-label={`Drag image ${imageIndex + 1} to reorder`}
            title="Drag to reorder. Use arrow keys to move."
            onDragStart={event => handleDragStart(event, imageIndex)}
            onDragEnd={handleDragEnd}
            onKeyDown={event => handleDragHandleKeyDown(event, imageIndex)}
          >
            <FontAwesomeV6Icon iconName="grip-vertical" />
          </button>
          <Typography variant="body2" className={moduleStyles.imageHeader}>
            Image {imageIndex + 1}
          </Typography>
          <ImageInput
            initialImageUrl={image.imageUrl}
            updateImageUrl={(imageUrl: string) =>
              updateImage(imageIndex, {...image, imageUrl})
            }
            dimensions={{width: PANEL_WIDTH, height: PANEL_HEIGHT}}
            fileTypes={['GIF', 'JPG', 'PNG']}
            showPreview
          />
          <label className={moduleStyles.imageAltText}>
            Alt text
            <input
              type="text"
              value={image.altText || ''}
              onChange={e =>
                updateImage(imageIndex, {
                  ...image,
                  altText: e.target.value || undefined,
                })
              }
            />
          </label>
          <label className={moduleStyles.imageSlider}>
            X: {image.x ?? DEFAULT_PANEL_IMAGE_X}%
            <input
              type="range"
              min={0}
              max={100}
              value={image.x ?? DEFAULT_PANEL_IMAGE_X}
              onChange={e =>
                updateImage(imageIndex, {...image, x: Number(e.target.value)})
              }
            />
          </label>
          <label className={moduleStyles.imageSlider}>
            Y: {image.y ?? DEFAULT_PANEL_IMAGE_Y}%
            <input
              type="range"
              min={0}
              max={100}
              value={image.y ?? DEFAULT_PANEL_IMAGE_Y}
              onChange={e =>
                updateImage(imageIndex, {...image, y: Number(e.target.value)})
              }
            />
          </label>
          <label className={moduleStyles.imageSlider}>
            Scale: {image.width ?? DEFAULT_PANEL_IMAGE_WIDTH}%
            <input
              type="range"
              min={1}
              max={100}
              value={image.width ?? DEFAULT_PANEL_IMAGE_WIDTH}
              onChange={e =>
                updateImage(imageIndex, {
                  ...image,
                  width: Number(e.target.value),
                })
              }
            />
          </label>
          <button
            type="button"
            className={moduleStyles.deleteButton}
            onClick={() => deleteImage(imageIndex)}
            aria-label="Delete image"
          >
            <FontAwesomeV6Icon iconName="trash" />
          </button>
        </div>
      ))}
      <Button
        type="button"
        onClick={addImage}
        text="Add Image"
        color="gray"
        icon="plus"
      />
    </div>
  );
};

export default EditPanelsImages;
