import React, {useLayoutEffect, useState} from 'react';

import standaloneVideoLocale from './locale';

import styles from './video.module.scss';

interface VideoProps {
  children: React.ReactNode;
  src: string | undefined;
}

function useWindowSize() {
  const [size, setSize] = useState([
    document.documentElement.clientWidth,
    document.documentElement.clientHeight,
  ]);
  useLayoutEffect(() => {
    function updateSize() {
      const width = document.documentElement.clientWidth;
      const height = document.documentElement.clientHeight;
      setSize([width, height]);
    }
    window.addEventListener('resize', updateSize);
    updateSize();
    return () => window.removeEventListener('resize', updateSize);
  }, []);
  return size;
}

/**
 * Renders a simple modal video player.
 */

const Video: React.FunctionComponent<VideoProps> = ({children, src}) => {
  // Leave a margin to the left and the right of the video, to the edges
  // of the screen.
  const horizontalMargin = 40;

  // Leave a vertical margin above and below the video, to the edges of the
  // screen.
  const verticalMargin = 50;

  // We need room below the video for the children passed in.  This area
  // can contain things like a download link and a Continue button.
  const childrenAreaHeight = 70;

  // The aspect ratio of the video.
  const videoAspectRatio = 16 / 9;

  let [targetWidth, targetHeight] = useWindowSize();
  targetWidth -= horizontalMargin * 2;
  targetHeight -= verticalMargin * 2 + childrenAreaHeight;

  let width, height;
  if (targetWidth / targetHeight > videoAspectRatio) {
    height = targetHeight;
    width = videoAspectRatio * height;
  } else {
    width = targetWidth;
    height = width / videoAspectRatio;
  }

  return (
    <div id="video-container" className={styles.container}>
      <div className={styles.inner} style={{width, height}}>
        <div className={styles.video}>
          {src && (
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
