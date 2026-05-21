import React from 'react';

import Dialog from './Dialog';

import sharedStyles from '../curriculum-generator.module.scss';

// "We're partway through a generation run" dialog. Title flips from
// "Generating…" to "Done" based on isBusy; a progress bar tracks the
// `fraction` (0–1); the last ten log lines render below in monospace.
// The page-specific status content (current item name, phase label,
// detail) goes in as children — its shape varies per page, so we don't
// try to abstract it.

interface GenerationProgressDialogProps {
  isBusy: boolean;
  // 0–1; clamped to 100% at render time so an off-by-one in the caller
  // doesn't overflow the bar.
  fraction: number;
  log: string[];
  children?: React.ReactNode;
}

const GenerationProgressDialog: React.FC<GenerationProgressDialogProps> = ({
  isBusy,
  fraction,
  log,
  children,
}) => (
  <Dialog>
    <h2>{isBusy ? 'Generating…' : 'Done'}</h2>
    {children}
    <div className={sharedStyles.progressBarOuter}>
      <div
        className={sharedStyles.progressBarInner}
        style={{width: `${Math.min(100, fraction * 100)}%`}}
      />
    </div>
    <div>
      {log.slice(-10).map((line, i) => (
        <div className={sharedStyles.progressLine} key={i}>
          {line}
        </div>
      ))}
    </div>
  </Dialog>
);

export default GenerationProgressDialog;
