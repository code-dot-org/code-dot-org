import {Button} from '@code-dot-org/component-library/button';
import {Heading3} from '@code-dot-org/component-library/typography';
import classNames from 'classnames';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {MusicMetadata} from '@cdo/apps/music/ai/generate/GenerateCode';
import MusicProjectBar from '@cdo/apps/music/views/MusicProjectBar';
import TimelineUI from '@cdo/apps/music/views/Timeline/TimelineUI';
import mixMoveAiBanner from '@cdo/static/dance/ai/mix-move-ai-banner-transparent.png';

import DanceControls from './DanceControls';
import DanceLoading from './DanceLoading';

import moduleStyles from './dance-view.module.scss';

interface DanceShareProps {
  guideMode?: string;
  usingMusicProject?: boolean;
  loadedMusicProject?: boolean;
  musicTitle?: string;
  visualizationId: string;
  isLoading: boolean;
  musicMetadata?: MusicMetadata;
  isRunning: boolean;
  musicPlayheadPosition?: number;
  runProgram: () => void;
  resetProgram: () => void;
}

/**
 * Share view for Dance Party Lab2 projects, including the Music Dance AI combo project.
 * Largely adapted from {@link MusicPlayView}; consider consolidating in the future.
 */
const DanceShare: React.FC<DanceShareProps> = props => {
  const {
    musicMetadata,
    musicPlayheadPosition,
    usingMusicProject,
    loadedMusicProject,
  } = props;

  const projectTitle = Lab2Registry.getInstance()
    .getProjectManager()
    ?.getLastChannel()?.name;

  const shareData = {
    title: projectTitle,
    url: window.location.href,
  };

  // Share button will only appear when user's browser supports the Web Share API.
  // (Can be mobile browsers and some desktop browser like macOS Safari)
  // Requires HTTPS connection.
  // For testing purposes, we can pass a query parameter canShare=true to force the button to appear.
  const canShare =
    (navigator && navigator.canShare && navigator.canShare(shareData)) ||
    queryParams('canShare') === 'true';

  return (
    <div
      id="dance-lab"
      className={classNames(moduleStyles.danceLab, moduleStyles.share)}
    >
      <div
        className={classNames(
          moduleStyles.visualizationColumn,
          moduleStyles.share
        )}
      >
        <div className={moduleStyles.header}>
          <Heading3 className={moduleStyles.projectTitle}>
            {projectTitle}
          </Heading3>
          <img src={mixMoveAiBanner} alt="Mix & Move with AI" />
        </div>
        <div id={props.visualizationId} className={moduleStyles.visualization}>
          {usingMusicProject && (
            <MusicProjectBar
              isLoading={!loadedMusicProject}
              title={props.musicTitle}
              className={moduleStyles.musicProjectOverlay}
            />
          )}
          <DanceLoading isLoading={props.isLoading} />
        </div>
        {musicMetadata && musicPlayheadPosition !== undefined && (
          <div className={moduleStyles.timelineContainer}>
            <TimelineUI
              {...musicMetadata}
              isPlaying={props.isRunning}
              blockMode={'Simple2'}
              currentPlayheadPosition={musicPlayheadPosition}
              fixedLength
            />
          </div>
        )}
        <DanceControls
          onRun={props.runProgram}
          onReset={props.resetProgram}
          disabled={(usingMusicProject && !props.loadedMusicProject) || false}
        />
        <div className={moduleStyles.actionBar}>
          <Button
            text={'View code'}
            type="tertiary"
            color="black"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'code'}}
            onClick={() =>
              Lab2Registry.getInstance().getProjectManager()?.redirectToView()
            }
          />
          {canShare && (
            <Button
              text={'Share'}
              type="tertiary"
              color="black"
              size="s"
              iconLeft={{
                iconStyle: 'solid',
                iconName: 'arrow-up-from-bracket',
              }}
              onClick={() => navigator?.share(shareData)}
            />
          )}
          <Button
            text={'Make my own'}
            type="tertiary"
            color="black"
            size="s"
            iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
            onClick={() =>
              Lab2Registry.getInstance().getProjectManager()?.redirectToRemix()
            }
          />
        </div>
      </div>
    </div>
  );
};

export default DanceShare;
