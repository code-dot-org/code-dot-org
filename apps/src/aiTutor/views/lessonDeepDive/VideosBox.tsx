import {Typography} from '@mui/material';
import React, {FC} from 'react';

import {pythonLabVideoFiles} from '@cdo/apps/pythonlab/pythonLabVideos';
import TutorVideo from '@cdo/apps/jsonVideo/TutorVideo';

const VideosBox: FC = () => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      Videos
    </Typography>
    {pythonLabVideoFiles.map(({url, description}) => (
      <div key={url}>
        <TutorVideo href={url} />
        <Typography variant="body2" sx={{mt: 1, mb: 2}}>
          {description}
        </Typography>
      </div>
    ))}
  </div>
);

export default VideosBox;
