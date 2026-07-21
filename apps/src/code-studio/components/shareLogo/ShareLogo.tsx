import React from 'react';

// The inverse (white) logo reads on dark backgrounds; the black logo on light.
import inverseLogo from '@cdo/static/logo-codeai-inverse.svg';
import blackLogo from '@cdo/static/logo-codeai.svg';

import useBackgroundTheme from './useBackgroundTheme';

interface ShareLogoProps {
  // Where the logo links: '/home' when signed in, else the marketing site.
  homeUrl: string;
}

/**
 * The fixed top-left logo on share pages. Picks the inverse (white) logo on
 * dark backgrounds and the black logo on light backgrounds.
 */
const ShareLogo: React.FunctionComponent<ShareLogoProps> = ({homeUrl}) => {
  const theme = useBackgroundTheme();
  const src = theme === 'light' ? blackLogo : inverseLogo;

  return (
    <a href={homeUrl}>
      <img id="logo-img" src={src} alt="CodeAI home" />
    </a>
  );
};

export default ShareLogo;
