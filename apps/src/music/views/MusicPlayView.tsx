import React, {memo, useCallback, useMemo} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import commonI18n from '@cdo/locale';
import musicPlayViewLogo from '@cdo/static/music/music-play-view.png';

import moduleStyles from './music-play-view.module.scss';

import musicI18n from '../locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {queryParams} from '@cdo/apps/code-studio/utils';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';

interface MusicPlayViewProps {
  setPlaying: (value: boolean) => void;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = ({
  setPlaying,
}) => {
  const {isPlaying, lastMeasure, currentPlayheadPosition} = useAppSelector(
    state => state.music
  );
  let progressSliderValue =
    ((currentPlayheadPosition - 1) / (lastMeasure - 1)) * 100;
  if (!progressSliderValue) {
    progressSliderValue = 0;
  }
  const projectName = useAppSelector(state => state.lab.channel?.name);
  // TODO: Use isLoading to disable play button and/or show some loading indicator (spinner, etc)
  // const isLoading = useAppSelector(
  //   state => state.music.soundLoadingProgress < 1
  // );

  const shareData = useMemo(
    () => ({
      title: projectName,
      url: window.location.href,
    }),
    [projectName]
  );

  // Share button will only appear when users browser supports the Web Share API
  // (Can be mobile browsers and some desktop browser like macOS Safari)
  // Requires HTTPS connection (adhoc or production page).
  // Was unable to access it on localhost with our routing (http://localhost-studio.code.org:3000/
  // is not considered a safe URL by browser, only http://localhost:3000/ is).

  // For testing purposes, we can pass a query parameter canShare=true to force the button to appear.
  const canShareInternal = queryParams('canShare') === 'true';
  const canShare =
    (navigator && navigator.canShare && navigator.canShare(shareData)) ||
    canShareInternal;

  const projectManager = Lab2Registry.getInstance().getProjectManager();
  const onShareProject = useCallback(() => {
    navigator?.share(shareData);
  }, [shareData]);
  const onViewCode = useCallback(() => {
    if (projectManager) {
      projectManager.flushSave().then(() => {
        projectManager.redirectToView();
      });
    }
  }, [projectManager]);
  const onRemix = useCallback(() => {
    if (projectManager) {
      projectManager.flushSave().then(() => {
        projectManager.redirectToRemix();
      });
    }
  }, [projectManager]);

  return (
    <div className={moduleStyles.musicPlayViewContainer}>
      <div className={moduleStyles.musicPlayViewCardContainer}>
        <img
          className={moduleStyles.musicPlayViewImage}
          src={musicPlayViewLogo}
          alt="Code.org play view logo"
        />
        <div className={moduleStyles.musicPlayViewCard}>
          <div className={moduleStyles.musicPlayViewInfoSection}>
            <Heading2>{projectName}</Heading2>
            <BodyTwoText>{musicI18n.builtWithMusicLab()}</BodyTwoText>
          </div>
          <div className={moduleStyles.musicPlayViewPlaySection}>
            <Button
              isIconOnly={true}
              icon={{
                iconStyle: 'solid',
                iconName: !isPlaying ? 'play' : 'stop',
              }}
              onClick={() => setPlaying(!isPlaying)}
              size="s"
              color="white"
              type="secondary"
            />
            <input type="range" value={progressSliderValue} min="0" max="100" />
          </div>

          <div className={moduleStyles.musicPlayViewButtonsSection}>
            <Button
              text={commonI18n.viewCode()}
              type="secondary"
              color="white"
              size="s"
              iconLeft={{iconStyle: 'solid', iconName: 'code'}}
              onClick={onViewCode}
            />
            <Button
              text={commonI18n.makeMyOwn()}
              type="secondary"
              color="white"
              size="s"
              iconLeft={{iconStyle: 'regular', iconName: 'pen-to-square'}}
              onClick={onRemix}
            />
          </div>
          {canShare && (
            <div className={moduleStyles.musicPlayViewButtonsSection}>
              <Button
                text={musicI18n.share()}
                type="secondary"
                color="white"
                size="s"
                iconLeft={{
                  iconStyle: 'solid',
                  iconName: 'arrow-up-from-bracket',
                }}
                onClick={onShareProject}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
