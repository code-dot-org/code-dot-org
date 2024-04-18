import React, {memo} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './music-play-view.module.scss';
import Link from '@cdo/apps/componentLibrary/link';

import musicI18n from '../locale';

const codeOrgLogo = require(`@cdo/static/music/code-dot-org-white-logo.png`);

interface MusicPlayViewProps {
  onPlay: () => void;
}

const MusicPlayView: React.FunctionComponent<MusicPlayViewProps> = props => {
  console.log(navigator);

  return (
    <div className={moduleStyles.musicPlayViewContainer}>
      <div className={moduleStyles.musicPlayViewCard}>
        <img src={codeOrgLogo} alt="Code.org" />
        <Heading2>My Awesome Mix</Heading2>
        <BodyTwoText>
          {musicI18n.madeWithMusicLabOn()}{' '}
          <Link href="https://studio.code.org/projects/music">Code.org</Link>
        </BodyTwoText>

        <input type="range" />

        <div className={moduleStyles.musicPlayViewButtonsSection}>
          <Button
            text={musicI18n.viewCode()}
            type="secondary"
            color="white"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'code'}}
            onClick={() => props.onPlay()}
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
        {true && (
          <div className={moduleStyles.musicPlayViewButtonsSection}>
            <Button
              text={musicI18n.share()}
              type="secondary"
              color="white"
              size="s"
              iconLeft={{iconStyle: 'solid', iconName: 'share'}}
              onClick={() =>
                navigator.share({
                  title: 'My Awesome Mix',
                  url: window.location.href,
                })
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default memo(MusicPlayView);
