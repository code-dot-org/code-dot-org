// Lab2Wrapper
//
// Lab2 uses this component to wrap the apps that it switches between.  This
// component remains agnostic to the children that are passed into it, which
// are the apps.  But this component provides a few useful things: an error
// boundary; a fade-in between levels; a loading spinner when a level takes a
// while to load; and a sad bee when things go wrong.

import classNames from 'classnames';
import React, {useEffect} from 'react';
import {useSelector} from 'react-redux';

import {setCurrentLevelId} from '@cdo/apps/code-studio/progressRedux';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import ErrorBoundary from '../ErrorBoundary';
import {
  LabState,
  isLabLoading,
  hasPageError,
  setIsShareView,
} from '../lab2Redux';
import Lab2Registry from '../Lab2Registry';
import {getAppOptionsLevelId, getIsShareView} from '../projects/utils';

import {ErrorFallbackPage, ErrorUI} from './ErrorFallbackPage';
import Loading from './Loading';

import moduleStyles from './Lab2Wrapper.module.scss';

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

  // Store some server-provided data in redux.

  const dispatch = useAppDispatch();
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);

  // Store the level ID provided by App Options in redux if necessary.
  // This is needed on pages without a header, such as the share view.
  const appOptionsLevelId = getAppOptionsLevelId();
  useEffect(() => {
    if (!currentLevelId && appOptionsLevelId) {
      dispatch(setCurrentLevelId(appOptionsLevelId.toString()));
    }
  }, [currentLevelId, appOptionsLevelId, dispatch]);

  // Store whether we are in share view in redux, from App Options.
  const isShareView = getIsShareView();
  useEffect(() => {
    if (isShareView !== undefined) {
      dispatch(setIsShareView(isShareView));
    }
  }, [isShareView, dispatch]);

  return (
    <ErrorBoundary
      fallback={<ErrorFallbackPage />}
      onError={(error, componentStack) =>
        Lab2Registry.getInstance()
          .getMetricsReporter()
          .logError('Uncaught React Error', error, {
            componentStack,
          })
      }
    >
      <div
        id="lab-container"
        className={classNames(
          moduleStyles.labContainer,
          isLoading && moduleStyles.labContainerLoading,
          isShareView && moduleStyles.labContainerShareView
        )}
      >
        {children}
        <Loading isLoading={isLoading} />

        {isPageError && <ErrorUI message={errorMessage} />}
      </div>
    </ErrorBoundary>
  );
};

export default Lab2Wrapper;
