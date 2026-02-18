import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {
  BodyFourText,
  BodyTwoText,
  StrongText,
} from '@code-dot-org/component-library/typography';
import React from 'react';

import moduleStyles from './no-requests-placeholder.module.scss';

const NoRequestsPlaceholder: React.FunctionComponent = () => {
  return (
    <div className={moduleStyles.container}>
      <div className={moduleStyles.innerContainer}>
        <div className={moduleStyles.iconCircle}>
          <FontAwesomeV6Icon iconName="globe" />
        </div>
        <BodyTwoText className={moduleStyles.title}>
          <StrongText>No network activity</StrongText>
        </BodyTwoText>
        <BodyFourText className={moduleStyles.description}>
          Network requests will appear here when your app makes API calls.
        </BodyFourText>
      </div>
    </div>
  );
};

export default NoRequestsPlaceholder;
