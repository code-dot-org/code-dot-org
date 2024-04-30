import {FontAwesomeV6Icon} from '@cdo/component-library';
import React from 'react';
import moduleStyles from './loading-overlay.module.scss';
import classNames from 'classnames';

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
