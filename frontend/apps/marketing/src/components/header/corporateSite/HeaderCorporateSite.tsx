'use client';

import DSCOHeader, {
  getDefaultHeaderProps,
} from '@code-dot-org/component-library/cms/header';

import {getStudioBaseUrl} from '@/config/studio';
import logoImage from '@public/images/cdo-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.webp';
import appLabImage from '@public/images/header-app-lab-icon.webp';
import artistImage from '@public/images/header-artist-icon.webp';
import dancePartyImage from '@public/images/header-dance-party-icon.webp';
import gameLabImage from '@public/images/header-game-lab-icon.webp';
import musicLabImage from '@public/images/header-music-lab-icon.webp';
import pythonLabImage from '@public/images/header-python-lab-icon.webp';
import spriteLabImage from '@public/images/header-sprite-lab-icon.webp';

const defaultProps = getDefaultHeaderProps({
  logoImage: logoImage.src,
  spriteLabImage: spriteLabImage.src,
  artistImage: artistImage.src,
  appLabImage: appLabImage.src,
  gameLabImage: gameLabImage.src,
  musicLabImage: musicLabImage.src,
  dancePartyImage: dancePartyImage.src,
  pythonLabImage: pythonLabImage.src,
  allProjectsImage: allProjectsImage.src,
  studioUrl: getStudioBaseUrl(),
});

const Header: React.FC = () => <DSCOHeader {...defaultProps} />;

export default Header;
