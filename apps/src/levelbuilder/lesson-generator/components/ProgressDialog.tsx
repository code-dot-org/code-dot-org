import React from 'react';

import {ProgressUpdate} from '../types';

import moduleStyles from '../lesson-generator.module.scss';

const phaseLabel = (phase: ProgressUpdate['phase']): string => {
  switch (phase) {
    case 'creating':
      return 'Creating level';
    case 'planning':
      return 'Planning content';
    case 'generating-image':
      return 'Generating image';
    case 'saving-properties':
      return 'Saving content';
    case 'attaching':
      return 'Attaching levels to lesson';
  }
};

interface ProgressDialogProps {
  progress: ProgressUpdate | null;
  log: string[];
  isGenerating: boolean;
}

const ProgressDialog: React.FC<ProgressDialogProps> = ({
  progress,
  log,
  isGenerating,
}) => {
  const fraction =
    progress && progress.totalLevels > 0
      ? (progress.levelIndex + (progress.phase === 'attaching' ? 1 : 0.5)) /
        progress.totalLevels
      : 0;
  return (
    <div className={moduleStyles.dialogBackdrop} role="dialog" aria-modal>
      <div className={moduleStyles.dialog}>
        <h2>{isGenerating ? 'Generating…' : 'Done'}</h2>
        {progress && (
          <>
            <div>
              Level {progress.levelIndex + 1} of {progress.totalLevels}
              {progress.levelName && (
                <>
                  {' '}
                  — <code>{progress.levelName}</code>
                </>
              )}
            </div>
            <div>
              <strong>{phaseLabel(progress.phase)}</strong>
              {progress.detail ? `: ${progress.detail}` : ''}
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

export default ProgressDialog;
