import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@cdo/apps/componentLibrary/fontAwesomeV6Icon/FontAwesomeV6Icon';

import moduleStyles from './loading-overlay.module.scss';

const LoadingOverlay: React.FunctionComponent<{show: boolean}> = ({show}) => (
  <div
    className={classNames(
      moduleStyles.loadingContainer,
      show && moduleStyles.loadingContainerShow
    )}
  >
    <FontAwesomeV6Icon
      iconName="spinner"
      animationType="spin"
      className={moduleStyles.loadingSpinner}
    />
  </div>
);

export default LoadingOverlay;
