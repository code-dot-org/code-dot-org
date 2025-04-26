'use client';

import DSCOHeader, {
  getDefaultHeaderProps,
} from '@code-dot-org/component-library/cms/header';

import {getStudioUrl} from '@/config/studio';
import logoImage from '@public/images/cdo-logo-inverse.svg';
import allProjectsImage from '@public/images/header-all-projects-icon.png';
import appLabImage from '@public/images/header-app-lab-icon.png';
import artistImage from '@public/images/header-artist-icon.png';
import dancePartyImage from '@public/images/header-dance-party-icon.png';
import gameLabImage from '@public/images/header-game-lab-icon.png';
import musicLabImage from '@public/images/header-music-lab-icon.png';
import pythonLabImage from '@public/images/header-python-lab-icon.png';
import spriteLabImage from '@public/images/header-sprite-lab-icon.png';

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
  studioUrl: getStudioUrl(),
});

const Header: React.FC = () => <DSCOHeader {...defaultProps} />;

export default Header;
