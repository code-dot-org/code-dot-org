import classNames from 'classnames';
import React from 'react';

import {capitalizeFirstLetter} from '@cdo/apps/blockly/utils';
import {getCurrentLesson} from '@cdo/apps/code-studio/progressReduxSelectors';
import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import moduleStyles from './loading.module.scss';

export interface LoadingProps {
  isLoading: boolean;
}

const noFade = window.location.href.includes('lab2-no-fade');

const Loading: React.FunctionComponent<LoadingProps> = ({
  isLoading,
}: LoadingProps) => {
  const overlayStyle: string = noFade
    ? isLoading
      ? moduleStyles.noFadeLoading
      : moduleStyles.noFadeLoaded
    : isLoading
    ? moduleStyles.fadeLoading
    : moduleStyles.fadeLoaded;

  const backgroundSuffix = useAppSelector(state =>
    capitalizeFirstLetter(getCurrentLesson(state)?.background || 'dark')
  );

  return (
    <div
      id="fade-overlay"
      className={classNames(
        moduleStyles.solidBlock,
        moduleStyles[`solidBlock${backgroundSuffix}`],
        overlayStyle
      )}
    >
      {isLoading && (
        <div className={moduleStyles.slowLoadContainer}>
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
