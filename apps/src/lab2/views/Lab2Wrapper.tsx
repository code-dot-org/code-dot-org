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
import {LabState, isLabLoading, hasPageError} from '../lab2Redux';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import Lab2MetricsReporter from '../Lab2MetricsReporter';
import i18n from '@cdo/locale';

export interface Lab2WrapperProps {
  children: React.ReactNode;
}

const Lab2Wrapper: React.FunctionComponent<Lab2WrapperProps> = ({children}) => {
  const isLoading: boolean = useSelector(isLabLoading);
  const isPageError: boolean = useSelector(hasPageError);
  const errorMessage: string | undefined = useSelector(
    (state: {lab: LabState}) =>
      state.lab.pageError?.errorMessage || state.lab.pageError?.error?.message
  );
  const overlayStyle: string = isLoading
    ? moduleStyles.showingBlock
    : moduleStyles.fadeInBlock;

  return (
    <ErrorBoundary
      fallback={<ErrorFallbackPage />}
      onError={(error, componentStack) =>
        Lab2MetricsReporter.logError('Uncaught React Error', error, {
          componentStack,
        })
      }
    >
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

        {isPageError && <ErrorUI message={errorMessage} />}
      </div>
    </ErrorBoundary>
  );
};

export interface ErrorUIProps {
  message?: string;
}

export const ErrorUI: React.FunctionComponent<ErrorUIProps> = ({message}) => (
  <div id="page-error-container" className={moduleStyles.pageErrorContainer}>
    <div id="page-error" className={moduleStyles.pageError}>
      <img
        className={moduleStyles.pageErrorImage}
        src="/shared/images/sad-bee-avatar.png"
      />
      <div>{i18n.loadingError()}</div>
      {message && (
        <div className={moduleStyles.pageErrorMessage}>({message})</div>
      )}
    </div>
  </div>
);

export const ErrorFallbackPage = () => (
  <div id="lab-container" className={moduleStyles.labContainer}>
    <ErrorUI />
  </div>
);

export default Lab2Wrapper;
