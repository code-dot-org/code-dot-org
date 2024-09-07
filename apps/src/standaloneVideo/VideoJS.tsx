import React, {useRef} from 'react';
import videojs, {VideoJsPlayer, VideoJsPlayerOptions} from 'video.js';
import 'video.js/dist/video-js.css';

// Adapted from https://videojs.com/guides/react/

export const VideoJS = (props: {options: VideoJsPlayerOptions}) => {
  const videoRef: React.MutableRefObject<HTMLDivElement | null> = useRef(null);
  const videoRefCallback = (ref: HTMLDivElement) => {
    videoRef.current = ref;
  };

  const playerRef: React.MutableRefObject<VideoJsPlayer | null> = useRef(null);
  const {options} = props;

  React.useEffect(() => {
    // Make sure Video.js player is only initialized once
    if (!playerRef.current) {
      // The Video.js player needs to be _inside_ the component el for React 18 Strict Mode.
      const videoElement = document.createElement('video-js');

      videoElement.classList.add('vjs-big-play-centered');
      videoRef.current?.appendChild(videoElement);

      playerRef.current = videojs(videoElement, options, () => {
        videojs.log('player is ready');
      });

      // You could update an existing player in the `else` block here
      // on prop change, for example:
    } else {
      const player = playerRef.current;

      player.autoplay(options.autoplay || false);
      player.src(options.sources || '');
    }
  }, [options, videoRef]);

  // Dispose the Video.js player when the functional component unmounts
  React.useEffect(() => {
    const player = playerRef.current;

    return () => {
      if (player && !player.isDisposed()) {
        player.dispose();
        playerRef.current = null;
      }
    };
  }, [playerRef]);

  return (
    <div data-vjs-player>
      <div ref={videoRefCallback} />
    </div>
  );
};

export default VideoJS;
