import {Typography} from '@mui/material';
import React, {FC} from 'react';

import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';
import {pythonLabVideoFiles} from '@cdo/apps/pythonlab/pythonLabVideos';

import {JsonVideoData} from './types';

import styles from './videos-box.module.scss';

interface VideosBoxProps {
  jsonVideos: JsonVideoData[];
}

const VideosBox: FC<VideosBoxProps> = ({jsonVideos}) => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      Videos
    </Typography>
    {pythonLabVideoFiles.map(({key, url, description}) => (
      <div key={key} className={styles.videoWrapper}>
        <div className={styles.videoInner}>
          <TutorVideo href={url} />
          <Typography variant="body2" sx={{mt: 1, mb: 2}}>
            {description}
          </Typography>
        </div>
      </div>
    ))}
  </div>
);

export default VideosBox;
