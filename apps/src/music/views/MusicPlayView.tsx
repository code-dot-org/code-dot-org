import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  Typography,
  Button as MuiButton,
  IconButton as MuiIconButton,
} from '@mui/material';
import React, {memo, useCallback, useContext, useMemo} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import ProjectManager from '@cdo/apps/lab2/projects/ProjectManager';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';
import musicPlayViewLogo from '@cdo/static/music/music-play-view.png';

import {AnalyticsContext} from '../context';
import musicI18n from '../locale';

import ProgressSlider from './ProgressSlider';

import moduleStyles from './music-play-view.module.scss';

interface MusicPlayViewProps {
  setPlaying: (value: boolean) => void;
  projectName?: string;
  overrideProjectManager?: ProjectManager;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = ({
  setPlaying,
  projectName,
  overrideProjectManager,
}) => {
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const percentPlayed = useAppSelector(state => {
    const {currentPlayheadPosition, lastMeasure} = state.music;
    return lastMeasure === 1
      ? 0
      : ((currentPlayheadPosition - 1) / (lastMeasure - 1)) * 100;
  });

  // Disable play button until sound is loaded.
  const isLoading = useAppSelector(
    state => state.music.soundLoadingProgress < 1
  );
  const analyticsReporter = useContext(AnalyticsContext);

  const shareData = useMemo(
    () => ({
      title: projectName,
      url: window.location.href,
    }),
    [projectName]
  );

  // Share button will only appear when user's browser supports the Web Share API.
  // (Can be mobile browsers and some desktop browser like macOS Safari)
  // Requires HTTPS connection.
  // For testing purposes, we can pass a query parameter canShare=true to force the button to appear.
  const canShareInternal = queryParams('canShare') === 'true';
  const canShare = useMemo(() => {
    return (
      (navigator && navigator.canShare && navigator.canShare(shareData)) ||
      canShareInternal
    );
  }, [canShareInternal, shareData]);

  const projectManager =
    overrideProjectManager || Lab2Registry.getInstance().getProjectManager();

  const onShareProject = useCallback(() => {
    analyticsReporter?.onButtonClicked('shareFromShareView');
    navigator?.share(shareData);
  }, [shareData, analyticsReporter]);
  const onViewCode = useCallback(() => {
    analyticsReporter?.onButtonClicked('viewCodeFromShareView');
    projectManager?.redirectToView();
  }, [projectManager, analyticsReporter]);
  const onRemix = useCallback(() => {
    analyticsReporter?.onButtonClicked('remixFromShareView');
    if (projectManager) {
      projectManager.flushSave().then(() => {
        projectManager.redirectToRemix();
      });
    }
  }, [projectManager, analyticsReporter]);

  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.cardContainer}>
        <img
          className={moduleStyles.playViewImage}
          src={musicPlayViewLogo}
          alt="Code.org play view logo"
        />
        <div className={moduleStyles.card}>
          <div className={moduleStyles.infoSection}>
            <Typography
              className={moduleStyles.infoText}
              variant="h2"
              gutterBottom
            >
              {projectName}
            </Typography>
            <Typography
              className={moduleStyles.infoText}
              variant="body2"
              gutterBottom
            >
              {musicI18n.builtWithMusicLab()}
            </Typography>
          </div>
          <div className={moduleStyles.playSection}>
            <MuiIconButton
              variant="outlined"
              color="white"
              size="large"
              disabled={isLoading}
              className={moduleStyles.playViewButton}
              onClick={() => setPlaying(!isPlaying)}
              type="button"
              aria-label={isPlaying ? 'Stop' : 'Play'}
            >
              <FontAwesomeV6Icon
                iconStyle="solid"
                iconName={!isPlaying ? 'play' : 'stop'}
              />
            </MuiIconButton>
            <ProgressSlider percentProgress={percentPlayed} />
          </div>

          <div className={moduleStyles.buttonsSection}>
            <MuiButton
              variant="text"
              color="secondary"
              size="extraSmall"
              onClick={onViewCode}
              type="button"
              startIcon={
                <FontAwesomeV6Icon iconStyle="solid" iconName="code" />
              }
            >
              {commonI18n.viewCode()}
            </MuiButton>
            {canShare && (
              <MuiButton
                variant="text"
                color="secondary"
                size="extraSmall"
                onClick={onShareProject}
                type="button"
                startIcon={
                  <FontAwesomeV6Icon
                    iconStyle="solid"
                    iconName="arrow-up-from-bracket"
                  />
                }
              >
                {musicI18n.share()}
              </MuiButton>
            )}
            <MuiButton
              variant="text"
              color="secondary"
              size="extraSmall"
              onClick={onRemix}
              type="button"
              startIcon={
                <FontAwesomeV6Icon
                  iconStyle="regular"
                  iconName="pen-to-square"
                />
              }
            >
              {commonI18n.makeMyOwn()}
            </MuiButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
