import classNames from 'classnames';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import moduleStyles from './loading-overlay.module.scss';

export interface LoadingOverlayProps {
  show: boolean;
  delayAppearance?: boolean;
}

const LoadingOverlay = ({show, delayAppearance}: LoadingOverlayProps) => (
  <div
    className={classNames(
      moduleStyles.loadingContainer,
      show && moduleStyles.loadingContainerShow,
      delayAppearance && moduleStyles.loadingContainerDelay,
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
