import React, {memo, useCallback, useMemo} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './music-play-view.module.scss';
import Link from '@cdo/apps/componentLibrary/link';

import musicI18n from '../locale';

const codeOrgLogo = require(`@cdo/static/code-dot-org-white-logo.svg`);

interface MusicPlayViewProps {
  onPlay: () => void;
  onStop: () => void;
  isPlaying: boolean;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = ({
  isPlaying,
  onPlay,
  onStop,
}) => {
  const shareData = useMemo(
    () => ({
      title: 'Project Name',
      url: window.location.href,
    }),
    []
  );
  // Share button will only appear when users browser supports the Web Share API
  // (Can be mobile browsers and some desktop browser like macOS Safari)
  // Requires HTTPS connection (adhoc or production page).
  // Was unable to access it on localhost with our routing (http://localhost-studio.code.org:3000/
  // is not considered a sage URL by browser, only http://localhost:3000/ is).
  const canShare =
    navigator && navigator.canShare && navigator.canShare(shareData);
  const shareProject = useCallback(() => {
    navigator?.share(shareData);
  }, [shareData]);

  return (
    <div className={moduleStyles.musicPlayViewContainer}>
      <div className={moduleStyles.musicPlayViewCard}>
        <img src={codeOrgLogo} alt="Code.org" />
        <Heading2>
          {/*TODO: Project name should be here instead of placeholder text*/}
          My Awesome Mix
        </Heading2>
        <BodyTwoText>
          {musicI18n.madeWithMusicLabOn()} <Link href="/">Code.org</Link>
        </BodyTwoText>

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
            text={musicI18n.viewCode()}
            type="secondary"
            color="white"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'code'}}
            onClick={onPlay}
          />
          <Button
            text={musicI18n.remix()}
            type="secondary"
            color="white"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'user-music'}}
            onClick={() => console.log('make my own, redirect to remix')}
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
              onClick={shareProject}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
