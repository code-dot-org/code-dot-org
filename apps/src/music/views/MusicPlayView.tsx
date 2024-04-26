import React, {memo, useCallback, useMemo} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import commonI18n from '@cdo/locale';
import codeOrgLogo from '@cdo/static/code-dot-org-white-logo.svg';

import moduleStyles from './music-play-view.module.scss';

import musicI18n from '../locale';

interface MusicPlayViewProps {
  isPlaying: boolean;
  onPlay: () => void;
  onStop: () => void;
  projectName: string;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = ({
  isPlaying,
  onPlay,
  onStop,
  projectName,
}) => {
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
  const canShare =
    navigator && navigator.canShare && navigator.canShare(shareData);

  const onShareProject = useCallback(() => {
    navigator?.share(shareData);
  }, [shareData]);
  const onViewCode = useCallback(() => {
    console.log('view code');
  }, []);
  const onRemix = useCallback(() => {
    console.log('make my own');
  }, []);

  return (
    <div className={moduleStyles.musicPlayViewContainer}>
      <div className={moduleStyles.musicPlayViewCard}>
        <div className={moduleStyles.musicPlayViewInfoSection}>
          <img src={codeOrgLogo} alt="Code.org" />
          <Heading2>{projectName}</Heading2>
          <BodyTwoText>Built with Music Lab</BodyTwoText>
        </div>

        <div className={moduleStyles.musicPlayViewPlaySection}>
          <Button
            isIconOnly={true}
            icon={{iconStyle: 'solid', iconName: !isPlaying ? 'play' : 'stop'}}
            onClick={!isPlaying ? onPlay : onStop}
            size="s"
            color="white"
            type="secondary"
          />
          {/*TODO: get the total length of the song, show current player position/play progress*/}
          <input type="range" min="0" max="100" />
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
            iconLeft={{iconStyle: 'solid', iconName: 'user-music'}}
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
              iconLeft={{iconStyle: 'solid', iconName: 'share'}}
              onClick={onShareProject}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
