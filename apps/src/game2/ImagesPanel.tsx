import React, {useCallback, useState} from 'react';

import ImageGenerateDialog from './ImageGenerateDialog';
import moduleStyles from './game2View.module.scss';
import {generateImage, uploadAssetToProject} from './imageGeneration';
import {Game2ImageEntry} from './types';

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
    async (prompt: string) => {
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
          channelId
        );
        await uploadAssetToProject(channelId, filename, uint8Array, mediaType);
        onImagesChange([...images, {filename, prompt}]);
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
          className={`${moduleStyles.imageCell} ${moduleStyles.addImageCell}`}
          onClick={() => setDialogOpen(true)}
          disabled={generating}
        >
          {generating ? '...' : '+'}
        </button>
        {images.map(img => (
          <div key={img.filename} className={moduleStyles.imageCell}>
            <img
              src={
                channelId
                  ? `/v3/assets/${channelId}/${encodeURIComponent(img.filename)}`
                  : ''
              }
              alt={img.prompt || img.filename}
            />
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
