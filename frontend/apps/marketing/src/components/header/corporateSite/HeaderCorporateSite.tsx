'use client';

import {getCookie, setCookie, deleteCookie} from 'cookies-next/client';
import {useRouter, useSearchParams} from 'next/navigation';
import {useEffect, useState} from 'react';

import DSCOHeader, {
  getDefaultHeaderProps,
} from '@code-dot-org/component-library/cms/header';

import {getStage} from '@/config/stage';
import {getStudioBaseUrl} from '@/config/studio';
import {getCookieNameByStage} from '@/cookies/getCookie';
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

const Header: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cookieName = getCookieNameByStage('_shortName', getStage());

  const [signedIn, setSignedIn] = useState<boolean>(() => {
    try {
      return !!getCookie(cookieName);
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      const currentUserShortName = searchParams.get('shortName');
      const signOut = searchParams.get('signOut');

      if (currentUserShortName) {
        setCookie(cookieName, currentUserShortName, {path: '/'});
        setSignedIn(true);

        const params = new URLSearchParams(searchParams.toString());
        params.delete('shortName');
        router.replace(`?${params.toString()}`, {scroll: false});
      }

      if (signOut) {
        deleteCookie(cookieName, {path: '/'});
        setSignedIn(false);

        const params = new URLSearchParams(searchParams.toString());
        params.delete('signOut');
        router.replace(`?${params.toString()}`, {scroll: false});
      }
    } catch (err) {
      console.warn('Error handling cookies in Header:', err);
      setSignedIn(false);
    }
  }, [searchParams, cookieName]);

  return <DSCOHeader {...defaultProps} isSignedIn={signedIn} />;
};

export default Header;
