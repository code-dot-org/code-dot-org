import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import classNames from 'classnames';
import React from 'react';

import moduleStyles from './loading-overlay.module.scss';

const LoadingOverlay: React.FunctionComponent<{
  show: boolean;
  delayAppearance?: boolean;
}> = ({show, delayAppearance}) => (
  <div
    className={classNames(
      moduleStyles.loadingContainer,
      show && moduleStyles.loadingContainerShow,
      delayAppearance && moduleStyles.loadingContainerDelay
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
