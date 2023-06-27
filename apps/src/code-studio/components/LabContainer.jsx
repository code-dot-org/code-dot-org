// LabContainer
//
// This React component is used to contain a lab that doesn't need page reloads
// between levels.
//
// For now, it's only used for the "music" app, and facilitates instant switching
// between "music" levels in the same lesson.
//
// It hides the level while loading, and plays a fade-in animation as the level appears.

import PropTypes from 'prop-types';
import React from 'react';
import {useSelector} from 'react-redux';
import classNames from 'classnames';
import moduleStyles from './LabContainer.module.scss';
import i18n from '@cdo/locale';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import ErrorBoundary from './ErrorBoundary';

const LabContainer = ({children, onError}) => {
  const isLabLoading = useSelector(state => state.lab.isLoading);
  const isPageError = useSelector(state => state.lab.isPageError);

  const overlayStyle = isLabLoading
    ? moduleStyles.showingBlock
    : moduleStyles.fadeInBlock;

  return (
    <ErrorBoundary fallback={<ErrorFallbackPage />} onError={onError}>
      <div
        id="lab-container"
        className={classNames(
          moduleStyles.labContainer,
          isLabLoading && moduleStyles.labContainerLoading
        )}
      >
        {children}
        <div
          id="fade-overlay"
          className={classNames(moduleStyles.solidBlock, overlayStyle)}
        >
          {isLabLoading && (
            <div className={moduleStyles.slowLoadContainer}>
              <div className={moduleStyles.spinnerContainer}>
                <FontAwesome
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

LabContainer.propTypes = {
  children: PropTypes.node.isRequired,
  onError: PropTypes.func.isRequired,
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

export default LabContainer;
