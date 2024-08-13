import React, {memo, useCallback, useContext, useMemo} from 'react';

import {queryParams} from '@cdo/apps/code-studio/utils';
import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import commonI18n from '@cdo/locale';
import musicPlayViewLogo from '@cdo/static/music/music-play-view.png';

import {AnalyticsContext} from '../context';
import musicI18n from '../locale';

import ProgressSlider from './ProgressSlider';

import moduleStyles from './music-play-view.module.scss';

interface MusicPlayViewProps {
  setPlaying: (value: boolean) => void;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = ({
  setPlaying,
}) => {
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const percentPlayed = useAppSelector(state => {
    const {currentPlayheadPosition, lastMeasure} = state.music;
    return lastMeasure === 1
      ? 0
      : ((currentPlayheadPosition - 1) / (lastMeasure - 1)) * 100;
  });

  const projectName = useAppSelector(state => state.lab.channel?.name);
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

  const projectManager = Lab2Registry.getInstance().getProjectManager();
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
            <Heading2 className={moduleStyles.infoText}>{projectName}</Heading2>
            <BodyTwoText className={moduleStyles.infoText}>
              {musicI18n.builtWithMusicLab()}
            </BodyTwoText>
          </div>
          <div className={moduleStyles.playSection}>
            <Button
              isIconOnly={true}
              icon={{
                iconStyle: 'solid',
                iconName: !isPlaying ? 'play' : 'stop',
              }}
              onClick={() => setPlaying(!isPlaying)}
              disabled={isLoading}
              size="l"
              color="white"
              type="secondary"
              className={moduleStyles.playViewButton}
            />
            <ProgressSlider percentProgress={percentPlayed} />
          </div>

          <div className={moduleStyles.buttonsSection}>
            <Button
              text={commonI18n.viewCode()}
              type="tertiary"
              color="white"
              size="xs"
              iconLeft={{iconStyle: 'solid', iconName: 'code'}}
              onClick={onViewCode}
            />
            {canShare && (
              <Button
                text={musicI18n.share()}
                type="tertiary"
                color="white"
                size="xs"
                iconLeft={{
                  iconStyle: 'solid',
                  iconName: 'arrow-up-from-bracket',
                }}
                onClick={onShareProject}
              />
            )}
            <Button
              text={commonI18n.makeMyOwn()}
              type="tertiary"
              color="white"
              size="xs"
              iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
              onClick={onRemix}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
