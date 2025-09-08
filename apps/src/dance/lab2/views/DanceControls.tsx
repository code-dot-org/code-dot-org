import {Button} from '@code-dot-org/component-library/button';
import React from 'react';

import MiniMusicPlayer from '@cdo/apps/music/views/MiniMusicPlayer';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './dance-view.module.scss';

interface DanceControlsProps {
  onRun: () => void;
  onReset: () => void;
  musicChannelId?: string;
  musicPackId?: string;
}

/**
 * Control buttons for Lab2 Dance Party. Manages flags related to
 * running and loading the program.
 */
const DanceControls: React.FunctionComponent<DanceControlsProps> = ({
  onRun,
  onReset,
  musicChannelId,
  musicPackId,
}) => {
  const isRunning = useAppSelector(state => state.dance.isRunning);
  const disabled = useAppSelector(
    state => state.dance.isLoading || state.dance.runIsStarting
  );

  const props = isRunning
    ? {
        text: 'Reset',
        onClick: onReset,
        iconLeft: {iconName: 'rotate-right'},
      }
    : {text: 'Run', onClick: onRun, iconLeft: {iconName: 'play'}};

  return (
    <div className={moduleStyles.controlsContainer}>
      <Button {...props} disabled={disabled} />
      {musicChannelId && (
        <div style={{position: 'absolute', bottom: -10, right: 0}}>
          <MiniMusicPlayer
            projects={[
              {
                name: 'My Music',
                id: musicChannelId,
                labConfig: {music: {packId: musicPackId || ''}},
                isOwner: false,
                projectType: 'music',
                publishedAt: null,
                createdAt: '',
                updatedAt: '',
              },
            ]}
            libraryName="launch2024"
            isPlaying={isRunning}
          />
        </div>
      )}
    </div>
  );
};

export default DanceControls;
