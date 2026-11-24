import React from 'react';

// The inverse (white) logo reads on dark backgrounds; the black logo on light.
import inverseLogo from '@cdo/static/logo-codeai-inverse.svg';
import blackLogo from '@cdo/static/logo-codeai.svg';

import {SHARE_LOGO_IMAGE_ID} from './shareLogoImageId';
import useBackgroundTheme from './useBackgroundTheme';

interface ShareLogoProps {
  logoUrl: string;
}

/**
 * The fixed top-left logo on share pages. Picks the inverse (white) logo on
 * dark backgrounds and the black logo on light backgrounds.
 */
const ShareLogo: React.FunctionComponent<ShareLogoProps> = ({logoUrl}) => {
  const theme = useBackgroundTheme();
  const src = theme === 'light' ? blackLogo : inverseLogo;

  return (
    <a href={logoUrl}>
      <img id={SHARE_LOGO_IMAGE_ID} src={src} alt="CodeAI home" />
    </a>
  );
};

export default ShareLogo;
