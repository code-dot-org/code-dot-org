import React, {useCallback, useState} from 'react';

import ImageGenerateDialog from './ImageGenerateDialog';
import {generateImage, uploadAssetToProject} from './imageGeneration';
import {Game2ImageEntry} from './types';

import moduleStyles from './game2View.module.scss';

interface ImagesPanelProps {
  images: Game2ImageEntry[];
  channelId?: string;
  onImagesChange: (images: Game2ImageEntry[]) => void;
}

const ImagesPanel: React.FunctionComponent<ImagesPanelProps> = ({
  images,
  channelId,
  onImagesChange,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = useCallback(
    async (name: string, prompt: string, isSprite: boolean) => {
      setDialogOpen(false);
      if (!channelId) {
        console.error(
          '[Game2] No channelId available — level may not be project-backed.'
        );
        return;
      }
      setGenerating(true);
      try {
        const {filename, uint8Array, mediaType} = await generateImage(
          prompt,
          channelId,
          isSprite
        );
        await uploadAssetToProject(channelId, filename, uint8Array, mediaType);
        onImagesChange([...images, {name, filename, prompt}]);
      } finally {
        setGenerating(false);
      }
    },
    [channelId, images, onImagesChange]
  );

  return (
    <div className={moduleStyles.imagesPanel}>
      <div className={moduleStyles.imagesGrid}>
        <button
          type="button"
          className={`${moduleStyles.imageCell} ${moduleStyles.addImageCell}`}
          onClick={() => setDialogOpen(true)}
          disabled={generating}
        >
          {generating ? '...' : '+'}
        </button>
        {images.map(img => (
          <div key={img.filename} className={moduleStyles.imageItem}>
            <div className={moduleStyles.imageCell}>
              <img
                src={
                  channelId
                    ? `/v3/assets/${channelId}/${encodeURIComponent(
                        img.filename
                      )}`
                    : ''
                }
                alt={img.name}
              />
            </div>
            <span className={moduleStyles.imageName}>{img.name}</span>
          </div>
        ))}
      </div>

      {dialogOpen && (
        <ImageGenerateDialog
          onSubmit={handleGenerate}
          onClose={() => setDialogOpen(false)}
        />
      )}
    </div>
  );
};

export default ImagesPanel;
