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
  const progressValue =
    lastMeasure === 1
      ? 0
      : ((currentPlayheadPosition - 1) / (lastMeasure - 1)) * 100;
  const progressSliderValue = progressValue.toString();

  const projectName = useAppSelector(state => state.lab.channel?.name);
  // Disable play button until sound is loaded.
  const isLoading = useAppSelector(
    state => state.music.soundLoadingProgress < 1
  );

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
            <Heading2 className={moduleStyles.musicPlayViewInfoText}>
              {projectName}
            </Heading2>
            <BodyTwoText className={moduleStyles.musicPlayViewInfoText}>
              {musicI18n.builtWithMusicLab()}
            </BodyTwoText>
          </div>
          <div className={moduleStyles.musicPlayViewPlaySection}>
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
              className={moduleStyles.musicPlayViewButton}
            />
            <input
              type="range"
              readOnly
              value={progressSliderValue}
              min="0"
              max="100"
            />
          </div>

          <div className={moduleStyles.musicPlayViewButtonsSection}>
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
