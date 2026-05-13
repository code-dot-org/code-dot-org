import {Typography} from '@mui/material';
import React from 'react';

export default {
  // The component property is required by Storybook; we use MUI Typography
  // here since all stories render Typography variants directly.
  component: Typography,
};

//
// STORIES
//

export const Heading_1 = args => (
  <Typography variant="h1" gutterBottom>
    The quick brown fox
  </Typography>
);

export const Heading_2 = args => (
  <Typography variant="h2" gutterBottom>
    The quick brown fox
  </Typography>
);

export const Heading_3 = args => (
  <Typography variant="h3" gutterBottom>
    The quick brown fox
  </Typography>
);

export const Stacked = args => (
  <div>
    <Typography variant="h1" gutterBottom>
      The quick brown fox
    </Typography>
    <Typography variant="h2" gutterBottom>
      The quick brown fox
    </Typography>
    <Typography variant="h3" gutterBottom>
      The quick brown fox
    </Typography>
  </div>
);

export const WithPassThroughProps = args => (
  <Typography style={{color: 'red'}} variant="h1" gutterBottom>
    The quick brown fox
  </Typography>
);
