import React from 'react';

import {SlidesProgressUpdate} from '../types';

import moduleStyles from '../lesson-slides-generator.module.scss';

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
    <div className={moduleStyles.dialogBackdrop} role="dialog" aria-modal>
      <div className={moduleStyles.dialog}>
        <h2>{isGenerating ? 'Generating…' : 'Done'}</h2>
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
        <div className={moduleStyles.progressBarOuter}>
          <div
            className={moduleStyles.progressBarInner}
            style={{width: `${Math.min(100, fraction * 100)}%`}}
          />
        </div>
        <div>
          {log.slice(-10).map((line, i) => (
            <div className={moduleStyles.progressLine} key={i}>
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SlidesProgressDialog;
