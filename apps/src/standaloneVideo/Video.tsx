import React, {RefObject, useEffect, useRef, useState} from 'react';

import useElementSize from '@cdo/apps/util/hooks/useElementSize';

import standaloneVideoLocale from './locale';
import testYouTubeAvailable from './testYouTubeAvailable';
import VideoJS from './VideoJS';

import styles from './video.module.scss';

type VideoChoiceType = undefined | 'youtube' | 'fallback';

interface VideoProps {
  children: React.ReactNode;
  src?: string;
  download?: string;
  thumbnail?: string;
  // When provided, sizes the video to this element rather than the component's
  // own container. Use when Video is embedded inside a larger layout that
  // already owns the containing element (e.g. an adaptive step player).
  containerRef?: RefObject<HTMLElement>;
}

const Video: React.FunctionComponent<VideoProps> = ({
  children,
  src,
  download,
  thumbnail,
  containerRef,
}) => {
  const horizontalMargin = 40;
  const verticalMargin = 50;
  const childrenAreaHeight = 70;
  const videoAspectRatio = 16 / 9;

  // When no external ref is supplied, measure the component's own container.
  const ownRef = useRef<HTMLDivElement>(null);
  const activeRef: RefObject<HTMLElement> = containerRef ?? ownRef;
  const [clientWidth, clientHeight] = useElementSize(activeRef);

  const targetWidth = clientWidth - horizontalMargin * 2;
  const targetHeight = clientHeight - verticalMargin * 2 - childrenAreaHeight;

  let width, height;
  if (targetWidth / targetHeight > videoAspectRatio) {
    height = targetHeight;
    width = videoAspectRatio * height;
  } else {
    width = targetWidth;
    height = width / videoAspectRatio;
  }

  const [videoChoice, setVideoChoice] = useState<VideoChoiceType>(undefined);

  useEffect(() => {
    if (!src) {
      setVideoChoice('fallback');
      return;
    }
    const noCookie = src.includes('youtube-nocookie.com');
    testYouTubeAvailable(noCookie, available =>
      setVideoChoice(available ? 'youtube' : 'fallback')
    );
  }, [src]);

  const videoJsOptions = {
    autoplay: true,
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: download || '',
        type: 'video/mp4',
      },
    ],
    poster: thumbnail,
  };

  return (
    <div id="video-container" className={styles.container} ref={ownRef}>
      <div className={styles.inner} style={{width, height}}>
        <div className={styles.video}>
          {videoChoice === 'fallback' && download && (
            <VideoJS options={videoJsOptions} />
          )}
          {videoChoice === 'youtube' && src && (
            <iframe
              width="100%"
              height="100%"
              style={{border: 'none'}}
              src={src}
              title={standaloneVideoLocale.simpleModalVideoPlayer()}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          )}
        </div>
      </div>
      <div
        className={styles.childrenArea}
        style={{width: width, height: childrenAreaHeight}}
      >
        {children}
      </div>
    </div>
  );
};

export default Video;
