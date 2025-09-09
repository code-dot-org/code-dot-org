'use client';

import {useContext} from 'react';

import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';

import ContentfulVideo, {VideoProps} from './videoComponents';

const Video = (props: VideoProps) => {
  const onetrustContext = useContext(OneTrustContext);

  const isFunctionalCookieEnabled = () => {
    return (
      onetrustContext?.allowedCookies.has(OneTrustCookieGroup.Functional) ??
      false
    );
  };

  return (
    <ContentfulVideo
      {...props}
      isYouTubeCookieAllowed={isFunctionalCookieEnabled()}
    />
  );
};

export default Video;
