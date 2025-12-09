/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import React, {createContext, Suspense, useEffect, useState} from 'react';

import {useAiChatDisabled} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {PERMISSIONS} from '@cdo/apps/lab2/constants';
import {useInitialLabTheme} from '@cdo/apps/lab2/hooks/useInitialLabTheme';
import lab2I18n from '@cdo/apps/lab2/locale';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '@cdo/apps/lab2/projects/utils';
import {getLabViewPageAction, getIsLabViewBlocked} from '@cdo/apps/lab2/utils';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import useRequiredContext from '@cdo/apps/util/hooks/useRequiredContext';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';

import NoExemplarPage from './components/NoExemplarPage';
import ExtraLinks from './ExtraLinks';
import Loading from './Loading';

import moduleStyles from './lab-views-renderer.module.scss';

const queryHideExtraLinks = queryParams('hide-extra-links') === 'true';

const ExtraLinksButtonContext = createContext<{
  setShowExtraLinksButton: (show: boolean) => void;
} | null>(null);

/** Allows downstream components to show/hide the Extra Links button */
export const useExtraLinksButtonContext = () =>
  useRequiredContext(ExtraLinksButtonContext, 'ExtraLinksButtonContext');

const LabViewsRenderer: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const initialSources = useAppSelector(state => state.lab.initialSources);
  const channel = useAppSelector(state => state.lab.channel);

  const currentAppName = levelProperties?.appName;
  useEffect(() => {
    // Set the level path and app name in the analytics reporter for Statsig events.
    analyticsReporter.setProjectProperty('levelPath', window.location.pathname);
    currentAppName &&
      analyticsReporter.setProjectProperty('appName', currentAppName);
  }, [currentAppName]);

  const exemplarSources = levelProperties?.exemplarSources;

  const isBlockedAbuse = useAppSelector(state => !!state.lab.isBlockedAbuse);
  const projectSharingDisabled = useAppSelector(
    state => !!state.lab.projectSharingDisabled
  );
  const isTeacherOfProjectOwner = useAppSelector(
    state => !!state.lab.isTeacherOfProjectOwner
  );
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner || false);
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );

  const pageAction = getLabViewPageAction() || '';

  const isViewingExemplar = getAppOptionsViewingExemplar();

  const [showExtraLinksButton, setShowExtraLinksButton] = useState(true);

  useInitialLabTheme({
    currentAppName,
    levelProperties,
  });
  const isPredictLevel = useAppSelector(
    state => state.lab.levelProperties?.predictSettings?.isPredictLevel || false
  );
  const hasSubmittedPredictResponse = useAppSelector(
    state => state.predictLevel.hasSubmittedResponse
  );

  const {setChatDisabledState} = useAiChatDisabled();
  useEffect(() => {
    if (isPredictLevel && !hasSubmittedPredictResponse) {
      setChatDisabledState({
        chatDisabled: true,
        chatDisabledMessage: lab2I18n.predictTutorDisabledMessage(),
      });
    } else {
      setChatDisabledState({chatDisabled: false});
    }
  }, [isPredictLevel, hasSubmittedPredictResponse, setChatDisabledState]);

  const blockLabView = getIsLabViewBlocked(
    pageAction,
    isBlockedAbuse,
    projectSharingDisabled,
    isOwner,
    isTeacherOfProjectOwner,
    isProjectValidator
  );

  if (!currentAppName || blockLabView) {
    return null;
  }
  // Show a fallback no exemplar page if we are trying to view
  // exemplar but there is not exemplar for this level.
  if (isViewingExemplar && !exemplarSources) {
    return <NoExemplarPage />;
  }

  const properties = currentAppName && lab2EntryPoints[currentAppName];
  if (!properties) {
    console.warn("Don't know how to render app: " + currentAppName);
    return null;
  }

  const LabView = properties.view;

  return (
    <ProgressContainer key={currentAppName} appType={currentAppName}>
      <ExtraLinksButtonContext.Provider value={{setShowExtraLinksButton}}>
        <div
          id={`lab2-${currentAppName}`}
          className={moduleStyles.labContainer}
        >
          <Suspense fallback={<Loading isLoading={true} />}>
            <LabView
              levelProperties={levelProperties}
              initialSources={initialSources}
              channel={channel}
            />
          </Suspense>
          {!queryHideExtraLinks && showExtraLinksButton && (
            <ExtraLinks levelId={levelProperties.id} />
          )}
        </div>
      </ExtraLinksButtonContext.Provider>
    </ProgressContainer>
  );
};

export default LabViewsRenderer;
