import {Typography} from '@mui/material';
import React, {FC} from 'react';

const TutorSummaryBox: FC = () => (
  <div>
    <Typography variant="h2" sx={{fontSize: {xs: '1.5rem', sm: '2rem'}}}>
      Tutor Summary
    </Typography>
    <Typography variant="body1">
      Great work today! Here&apos;s a recap of everything we covered in this
      session.
    </Typography>
  </div>
);

export default TutorSummaryBox;
