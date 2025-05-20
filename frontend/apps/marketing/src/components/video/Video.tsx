'use client';

import {useContext} from 'react';

import DscoVideo, {VideoProps} from '@code-dot-org/component-library/video';

import OneTrustContext, {
  OneTrustCookieGroup,
} from '@/providers/onetrust/context/OneTrustContext';

const Video = (props: VideoProps) => {
  const onetrustContext = useContext(OneTrustContext);

  const isFunctionalCookieEnabled = () => {
    return (
      onetrustContext?.allowedCookies.has(OneTrustCookieGroup.Functional) ??
      false
    );
  };

  return (
    <DscoVideo
      {...props}
      isYouTubeCookieAllowed={isFunctionalCookieEnabled()}
    />
  );
};

export default Video;
