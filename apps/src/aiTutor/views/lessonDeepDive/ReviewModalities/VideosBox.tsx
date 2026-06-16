import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React, {FC, useState} from 'react';

import {JsonVideoData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';

import styles from './videos-box.module.scss';

interface VideosBoxProps {
  jsonVideos: JsonVideoData[];
}

const VideoCard: FC<Omit<JsonVideoData, 'key'>> = ({url, description}) => (
  <div className={styles.card}>
    <div className={styles.videoEmbed}>
      <TutorVideo href={url} />
    </div>
    {description && <p className={styles.description}>{description}</p>}
  </div>
);

// Lightweight carousel for the tutor's recommended videos: shows exactly one
// video at a time at every width, never two side by side. The single VideoCard
// is reused as the index changes — the new url flows into <json-video>, whose
// load() pauses the previous clip before fetching the next.
const VideoCarousel: FC<{videos: JsonVideoData[]}> = ({videos}) => {
  const [index, setIndex] = useState(0);
  const count = videos.length;
  const goTo = (next: number) => setIndex((next + count) % count);
  const current = videos[index];

  return (
    <div className={styles.carousel}>
      <div className={styles.carouselViewport}>
        <button
          type="button"
          className={classNames(styles.navButton, styles.navPrev)}
          aria-label="Previous video"
          onClick={() => goTo(index - 1)}
        >
          <FontAwesomeV6Icon iconName="arrow-left" />
        </button>
        <VideoCard url={current.url} description={current.description} />
        <button
          type="button"
          className={classNames(styles.navButton, styles.navNext)}
          aria-label="Next video"
          onClick={() => goTo(index + 1)}
        >
          <FontAwesomeV6Icon iconName="arrow-right" />
        </button>
      </div>
      <div className={styles.dots} role="tablist" aria-label="Choose video">
        {videos.map((video, i) => (
          <button
            type="button"
            key={video.key}
            className={classNames(styles.dot, i === index && styles.dotActive)}
            aria-label={`Video ${i + 1} of ${count}`}
            aria-current={i === index}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </div>
  );
};

const VideosBox: FC<VideosBoxProps> = ({jsonVideos}) => (
  <div className={styles.container}>
    <p className={styles.overline}>Video</p>
    {jsonVideos.length > 1 ? (
      <VideoCarousel videos={jsonVideos} />
    ) : (
      <div className={styles.list}>
        {jsonVideos.map(({key, ...video}) => (
          <VideoCard key={key} {...video} />
        ))}
      </div>
    )}
  </div>
);

export default VideosBox;
