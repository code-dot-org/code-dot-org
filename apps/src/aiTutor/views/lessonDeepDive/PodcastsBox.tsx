import {Typography} from '@mui/material';
import React, {FC} from 'react';

const PodcastsBox: FC = () => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      Podcasts
    </Typography>
    <Typography variant="body1">⚠️ COMING SOON</Typography>
  </div>
);

export default PodcastsBox;
