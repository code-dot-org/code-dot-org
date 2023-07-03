import PropTypes from 'prop-types';
import React, {useRef, useLayoutEffect, useEffect, useState} from 'react';
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
  const childrenAreaHeight = 70;

  let [targetWidth, targetHeight] = useWindowSize();
  targetWidth -= 80;
  targetHeight -= 100 + childrenAreaHeight;

  let width, height;
  if (targetWidth / targetHeight > 16 / 9) {
    height = targetHeight;
    width = (16 / 9) * height;
  } else {
    width = targetWidth;
    height = (9 / 16) * width;
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
              title=""
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
