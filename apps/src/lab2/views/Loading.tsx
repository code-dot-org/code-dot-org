import classNames from 'classnames';
import React from 'react';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './loading.module.scss';

export interface LoadingProps {
  isLoading: boolean;
  /**
   * Cover the nearest positioned ancestor rather than the viewport. Lab2Wrapper
   * sets this because the drawer is laid out beside the lab, and an overlay
   * that covers the window covers the drawer with it.
   */
  bounded?: boolean;
}

const noFade = window.location.href.includes('lab2-no-fade');

const Loading: React.FunctionComponent<LoadingProps> = ({
  isLoading,
  bounded = false,
}: LoadingProps) => {
  const overlayStyle: string = noFade
    ? isLoading
      ? moduleStyles.noFadeLoading
      : moduleStyles.noFadeLoaded
    : isLoading
    ? moduleStyles.fadeLoading
    : moduleStyles.fadeLoaded;

  const isShare = useAppSelector(state => state.lab.isShareView);

  return (
    <div
      id="fade-overlay"
      className={classNames(
        moduleStyles.solidBlock,
        bounded && moduleStyles.boundedBlock,
        overlayStyle,
        isShare && moduleStyles.shareViewOverlay
      )}
    >
      {isLoading && (
        <div
          className={classNames(
            moduleStyles.slowLoadContainer,
            'uitest-is-loading-overlay'
          )}
        >
          <div className={moduleStyles.spinnerContainer}>
            <FontAwesome
              title={undefined}
              icon="spinner"
              className={classNames('fa-pulse', 'fa-3x')}
            />
          </div>
          <div className={moduleStyles.spinnerText}>
            {commonI18n.slowLoading()}
          </div>
        </div>
      )}
    </div>
  );
};

export default Loading;
