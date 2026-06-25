import React from 'react';

import moduleStyles from './sprite-lab2-view.module.scss';

interface PlayTabProps {
  isRunning: boolean;
  onRun: () => void;
  onReset: () => void;
}

/**
 * The Play tab: hosts the classic p5.play playspace (the hardcoded #divGameLab
 * container the engine renders into) plus Run/Reset controls. The container is
 * always present while this tab is mounted so the engine has somewhere to draw.
 */
const PlayTab: React.FunctionComponent<PlayTabProps> = ({
  isRunning,
  onRun,
  onReset,
}) => {
  return (
    <div className={moduleStyles.playTab}>
      <div className={moduleStyles.playControls}>
        <button type="button" onClick={onRun} disabled={isRunning}>
          Run
        </button>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
      <div className={moduleStyles.playspace}>
        {/* The id is hardcoded in P5Wrapper.startExecution. */}
        <div id="divGameLab" />
      </div>
    </div>
  );
};

export default PlayTab;
