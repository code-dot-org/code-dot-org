import classNames from 'classnames';
import React from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';

import {useApp} from '@lab-base/contexts';

import moduleStyles from './loading.module.scss';

export interface LoadingProps {
  isLoading: boolean;
}

const Loading: React.FunctionComponent<LoadingProps> = ({
  isLoading,
}: LoadingProps) => {
  const noFade = (typeof window !== 'undefined' ? window.location.href.includes('lab2-no-fade') : false);
  const overlayStyle: string = noFade
    ? isLoading
      ? moduleStyles.noFadeLoading
      : moduleStyles.noFadeLoaded
    : isLoading
    ? moduleStyles.fadeLoading
    : moduleStyles.fadeLoaded;

  const isShare = !!useApp().lab?.isShareView;

  return (
    <div
      id="fade-overlay"
      className={classNames(
        moduleStyles.solidBlock,
        overlayStyle,
        isShare && moduleStyles.shareViewOverlay
      )}
    >
      {isLoading && (
        <div
          className={moduleStyles.slowLoadContainer}
        >
          <div className={moduleStyles.spinnerContainer}>
            <FontAwesomeV6Icon
              iconName="spinner"
              iconStyle="solid"
              className={classNames('fa-pulse', 'fa-3x')}
            />
          </div>
          <div className={moduleStyles.spinnerText}>
            This is taking longer than usual...
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;
