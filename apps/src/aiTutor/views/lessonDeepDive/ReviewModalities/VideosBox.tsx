import React, {FC} from 'react';

import {JsonVideoData} from '@cdo/apps/aiTutor/views/lessonDeepDive/types';
import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';

import styles from './videos-box.module.scss';

interface VideosBoxProps {
  jsonVideos: JsonVideoData[];
}

const VideosBox: FC<VideosBoxProps> = ({jsonVideos}) => (
  <div className={styles.container}>
    <p className={styles.overline}>Video</p>
    <div className={styles.list}>
      {jsonVideos.map(({key, url, description}) => (
        <div key={key} className={styles.card}>
          <div className={styles.videoEmbed}>
            <TutorVideo href={url} />
          </div>
          {description && <p className={styles.description}>{description}</p>}
        </div>
      ))}
    </div>
  </div>
);

export default VideosBox;
