import React from 'react';

import GenerationProgressDialog from '../../curriculum-generator/components/GenerationProgressDialog';
import {SlidesProgressUpdate} from '../types';

const phaseLabel = (phase: SlidesProgressUpdate['phase']): string => {
  switch (phase) {
    case 'planning':
      return 'Planning slide';
    case 'generating-image':
      return 'Generating image';
    case 'saving':
      return 'Saving slides.json';
  }
};

interface SlidesProgressDialogProps {
  progress: SlidesProgressUpdate | null;
  log: string[];
  isGenerating: boolean;
}

const SlidesProgressDialog: React.FC<SlidesProgressDialogProps> = ({
  progress,
  log,
  isGenerating,
}) => {
  const fraction =
    progress && progress.totalSlides > 0
      ? (progress.slideIndex +
          (progress.phase === 'generating-image' ? 0.5 : 0)) /
        progress.totalSlides
      : 0;
  return (
    <GenerationProgressDialog
      isBusy={isGenerating}
      fraction={fraction}
      log={log}
    >
      {progress && (
        <>
          <div>
            Slide {progress.slideIndex + 1} of {progress.totalSlides}
          </div>
          <div>
            <strong>{phaseLabel(progress.phase)}</strong>
          </div>
        </>
      )}
    </GenerationProgressDialog>
  );
};

export default SlidesProgressDialog;
