import ReactPlayer from 'react-player/youtube';

import {VideoProps} from './types';

interface YouTubeVideoProps extends VideoProps {
  src: string;
  posterThumbnail: string;
  onError: (error?: Error) => void;
}

const YouTubeVideo = ({src, onError}: YouTubeVideoProps) => {
  /**
   * Injects the YouTube IFrame API into the <head>. Does not reinject if already present.
   */
  const injectYouTubeApi = () => {
    // Do not inject if YouTube is already loaded
    if (
      window?.YT?.Player ||
      window.CDOVideoPlayer?.isYouTubeInjected ||
      typeof window.document === 'undefined'
    )
      return;

    // Injects the YouTube IFrame API into the DOM.
    // See: https://developers.google.com/youtube/iframe_api_reference
    const head =
      window.document.head || window.document.getElementsByTagName('head')[0];
    const el = window.document.createElement('script');

    el.async = true;
    // This script is considered a 'Functional Cookie', more details: https://code.org/cookies
    el.className = 'optanon-category-C0003';
    el.onerror = error => {
      console.error(error);

      window.CDOVideoPlayer = {
        ...window.CDOVideoPlayer,
        isYouTubeBlocked: true,
      };

      onError();
    };
    el.src = 'https://www.youtube.com/iframe_api';
    head.append(el);

    window.CDOVideoPlayer = {
      ...window.CDOVideoPlayer,
      isYouTubeInjected: true,
    };
  };

  injectYouTubeApi();

  return (
    <ReactPlayer
      height={'100%'}
      width={'100%'}
      url={src}
      onError={onError}
      previewTabIndex={-1} // the play icon is the tabbable portion
      playing={true}
      controls={true}
      config={{
        playerVars: {autoplay: 1, rel: 0},
      }}
    />
  );
};

export default YouTubeVideo;
