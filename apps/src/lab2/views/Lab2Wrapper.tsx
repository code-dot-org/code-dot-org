// Lab2Wrapper
//
// Lab2 uses this component to wrap the apps that it switches between.  This
// component remains agnostic to the children that are passed into it, which
// are the apps.  But this component provides a few useful things: an error
// boundary; a fade-in between levels; a loading spinner when a level takes a
// while to load; and a sad bee when things go wrong.

import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import moduleStyles from './Lab2Wrapper.module.scss';
import ErrorBoundary from '../ErrorBoundary';
import {isLabLoading} from '../lab2Redux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import {LabState} from '@cdo/apps/lab2/lab2Redux';
const i18n = require('@cdo/locale');

export interface Lab2WrapperProps {
  children: React.ReactNode;
  onError: (error: Error, componentStack: string) => void;
}

const Lab2Wrapper: React.FunctionComponent<Lab2WrapperProps> = ({
  children,
  onError,
}) => {
  const isLoading: boolean = useSelector(isLabLoading);
  const isPageError: boolean = useSelector(
    (state: {lab: LabState}) => state.lab.isPageError
  );

  const overlayStyle: string = isLoading
    ? moduleStyles.showingBlock
    : moduleStyles.fadeInBlock;

  return (
    <ErrorBoundary fallback={<ErrorFallbackPage />} onError={onError}>
      <div
        id="lab-container"
        className={classNames(
          moduleStyles.labContainer,
          isLoading && moduleStyles.labContainerLoading
        )}
      >
        {children}
        <div
          id="fade-overlay"
          className={classNames(moduleStyles.solidBlock, overlayStyle)}
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
                {i18n.slowLoading()}
              </div>
            </div>
          )}
        </div>

        {isPageError && <ErrorUI />}
      </div>
    </ErrorBoundary>
  );
};

export const ErrorUI = () => (
  <div id="page-error-container" className={moduleStyles.pageErrorContainer}>
    <div id="page-error" className={moduleStyles.pageError}>
      <img
        className={moduleStyles.pageErrorImage}
        src="/shared/images/sad-bee-avatar.png"
      />
      {i18n.loadingError()}
    </div>
  </div>
);

export const ErrorFallbackPage = () => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI />
  </div>
);

export default Lab2Wrapper;
