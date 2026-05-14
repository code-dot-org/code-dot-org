import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography, Button as MuiButton} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {MusicMetadata} from '@cdo/apps/music/ai/generate/GenerateCode';
import MusicProjectBar from '@cdo/apps/music/views/MusicProjectBar';
import TimelineUI from '@cdo/apps/music/views/Timeline/TimelineUI';
import mixMoveAiBanner from '@cdo/static/dance/mix-move-ai-banner-transparent.png';

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
        <div id={props.visualizationId} className={moduleStyles.visualization}>
          <div className={moduleStyles.header}>
            <Typography
              className={moduleStyles.projectTitle}
              variant="h3"
              gutterBottom
            >
              {projectTitle}
            </Typography>
            <img src={mixMoveAiBanner} alt="Mix & Move with AI" />
          </div>
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
          <MuiButton
            variant="text"
            color="secondary"
            size="small"
            onClick={() =>
              Lab2Registry.getInstance().getProjectManager()?.redirectToView()
            }
            type="button"
            startIcon={<FontAwesomeV6Icon iconStyle="solid" iconName="code" />}
          >
            {'View code'}
          </MuiButton>
          {canShare && (
            <MuiButton
              variant="text"
              color="secondary"
              size="small"
              onClick={() => navigator?.share(shareData)}
              type="button"
              startIcon={
                <FontAwesomeV6Icon
                  iconStyle="solid"
                  iconName="arrow-up-from-bracket"
                />
              }
            >
              {'Share'}
            </MuiButton>
          )}
          <MuiButton
            variant="text"
            color="secondary"
            size="small"
            loadingPosition="start"
            onClick={() =>
              Lab2Registry.getInstance().getProjectManager()?.redirectToRemix()
            }
            type="button"
            startIcon={
              <FontAwesomeV6Icon iconStyle="regular" iconName="pen-to-square" />
            }
          >
            {'Make my own'}
          </MuiButton>
        </div>
      </div>
    </div>
  );
};

export default DanceShare;
