import PropTypes from 'prop-types';
import React, {useLayoutEffect, useState} from 'react';
import styles from './video.module.scss';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

function useWindowSize() {
  const [size, setSize] = useState([0, 0]);
  useLayoutEffect(() => {
    function updateSize() {
      setSize([window.innerWidth, window.innerHeight]);
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
const Video = ({onClose}) => {
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
            src="https://www.youtube.com/embed/qYZF6oIZtfc"
            title="YouTube video player"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>
        <div className={styles.closeContainer}>
          <FontAwesome
            icon={'times'}
            onClick={onClose}
            className={styles.closeIcon}
          />
        </div>
      </div>
    </div>
  );
};

Video.propTypes = {
  onClose: PropTypes.func.isRequired
};

export default Video;
