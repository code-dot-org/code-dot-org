import React from 'react';

import type {BrandCode} from '@cdo/apps/util/brand';
import {useBrand} from '@cdo/apps/util/SiteConfigContext';

// The canonical brand logos live in the dashboard Rails asset dir; webpack
// bundles them (apps/webpack.config.js includes that dir in the asset rule).
// Importing them directly keeps a single source of truth with Cdo::Brand.
import codeaiInverseLogo from '../../../../../dashboard/app/assets/images/logo-codeai-inverse.svg';
import codeaiLogo from '../../../../../dashboard/app/assets/images/logo-codeai.svg';
import codeOrgInverseLogo from '../../../../../dashboard/app/assets/images/logo-inverse.svg';
import codeOrgLogo from '../../../../../dashboard/app/assets/images/logo.svg';

import useBackgroundTheme from './useBackgroundTheme';

interface BrandLogos {
  name: string;
  // `dark` (the inverse/white logo) is shown on dark backgrounds; `light` (the
  // black logo) on light backgrounds.
  dark: string;
  light: string;
}

const CODEAI_LOGOS: BrandLogos = {
  name: 'CodeAI',
  dark: codeaiInverseLogo,
  light: codeaiLogo,
};

const CODE_ORG_LOGOS: BrandLogos = {
  name: 'Code.org',
  dark: codeOrgInverseLogo,
  light: codeOrgLogo,
};

function logosForBrand(brand: BrandCode): BrandLogos {
  // 'codeai', 'codeai-next' and 'codeai-audit' all share CodeAI's identity.
  return brand === 'code' ? CODE_ORG_LOGOS : CODEAI_LOGOS;
}

interface ShareLogoProps {
  // Where the logo links: '/home' when signed in, else the marketing site.
  homeUrl: string;
}

/**
 * The fixed top-left logo on share pages. Picks the inverse (white) logo on
 * dark backgrounds and the black logo on light backgrounds.
 */
const ShareLogo: React.FunctionComponent<ShareLogoProps> = ({homeUrl}) => {
  const brand = useBrand();
  const theme = useBackgroundTheme();
  const logos = logosForBrand(brand);
  const src = theme === 'light' ? logos.light : logos.dark;

  return (
    <a href={homeUrl}>
      <img id="logo-img" src={src} alt={`${logos.name} home`} />
    </a>
  );
};

export default ShareLogo;
