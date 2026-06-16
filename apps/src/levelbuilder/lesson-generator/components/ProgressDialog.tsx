import React from 'react';

import GenerationProgressDialog from '../../curriculum-generator/components/GenerationProgressDialog';
import {ProgressUpdate} from '../types';

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
    <GenerationProgressDialog
      isBusy={isGenerating}
      fraction={fraction}
      log={log}
    >
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
    </GenerationProgressDialog>
  );
};

export default ProgressDialog;
