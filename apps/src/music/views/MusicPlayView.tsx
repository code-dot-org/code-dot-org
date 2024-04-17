import React from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {Heading2, BodyTwoText} from '@cdo/apps/componentLibrary/typography';
import moduleStyles from './music-play-view.module.scss';
import Link from '@cdo/apps/componentLibrary/link';

const codeOrgLogo = require(`@cdo/static/music/code-dot-org-white-logo.png`);

const MusicPlayView: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.musicPlayViewContainer}>
      <div className={moduleStyles.musicPlayViewCard}>
        <img src={codeOrgLogo} alt="Code.org" />
        <Heading2>My Awesome Mix</Heading2>
        <BodyTwoText>
          made with Music Lab on{' '}
          <Link href="https://studio.code.org/projects/music">Code.org</Link>
        </BodyTwoText>

        <input type="range" />

        <div className={moduleStyles.musicPlayViewButtonsSection}>
          <Button
            text="View Code"
            type="secondary"
            color="white"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'code'}}
            onClick={() => console.log('view code, redirect to view')}
          />
          <Button
            text="Maky My Own"
            type="secondary"
            color="white"
            size="s"
            iconLeft={{iconStyle: 'solid', iconName: 'user-music'}}
            onClick={() => console.log('make my own, redirect to remix')}
          />
        </div>
      </div>
    </div>
  );
};

export default MusicPlayView;
