import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import moduleStyles from './no-requests-placeholder.module.scss';

const NoRequestsPlaceholder: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.innerContainer}>
        <div className={moduleStyles.iconCircle}>
          <FontAwesomeV6Icon iconName="globe" />
        </div>
        <Typography className={moduleStyles.title} variant="body2" gutterBottom>
          <Typography variant="strong">No network activity</Typography>
        </Typography>
        <Typography
          className={moduleStyles.description}
          variant="body4"
          gutterBottom
        >
          Network requests will appear here when your app makes API calls.
        </Typography>
      </div>
    </div>
  );
};

export default NoRequestsPlaceholder;
