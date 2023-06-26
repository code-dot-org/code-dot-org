import PropTypes from 'prop-types';
import React, {useRef, useLayoutEffect, useEffect, useState} from 'react';
import styles from './video.module.scss';

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
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
const Video = ({id, onClose}) => {
  const startTime = useRef(null);

  useEffect(() => {
    startTime.current = Date.now();
  }, []);

  let [targetWidth, targetHeight] = useWindowSize();
  targetWidth -= 80;
  targetHeight -= 100;

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
          <iframe
            width="100%"
            height="100%"
            style={{border: 'none'}}
            src="https://www.youtube-nocookie.com/embed/ab2SBrfkKXU?rel=0"
            title=""
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
};

Video.propTypes = {
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default Video;
