/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import React, {Suspense, useEffect} from 'react';

import {AiChatDisabledProvider} from '@cdo/apps/aichat/context/aiChatDisabledContext';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {PERMISSIONS} from '@cdo/apps/lab2/constants';
import {useInitialLabTheme} from '@cdo/apps/lab2/hooks/useInitialLabTheme';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '@cdo/apps/lab2/projects/utils';
import {
  getLabViewPageAction,
  isUsingResourcePanel,
  getIsLabViewBlocked,
} from '@cdo/apps/lab2/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';

import NoExemplarPage from './components/NoExemplarPage';
import ExtraLinks from './ExtraLinks';
import Loading from './Loading';

import moduleStyles from './lab-views-renderer.module.scss';

const LabViewsRenderer: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const initialSources = useAppSelector(state => state.lab.initialSources);

  const currentAppName = levelProperties?.appName;
  const exemplarSources = levelProperties?.exemplarSources;
  const levelId = levelProperties?.id;

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
  const isProjectLevel = levelProperties?.isProjectLevel || false;
  const hideExtraLinks =
    queryParams('hide-extra-links') === 'true' ||
    isUsingResourcePanel(currentAppName || '', isProjectLevel);

  useInitialLabTheme({
    currentAppName,
    levelProperties,
  });

  useEffect(() => {
    const footer = document.getElementById('page-small-footer');
    // The resource panel has includes copyright and language, so we hide the footer.
    // We control this here so the footer will show up on levels that do not use the resource panel,
    // such as panels levels. The footer is controlled by the server, so we need to show/hide it here
    // to ensure it will show up when we switch to a level that does not use the resource panel.
    if (isUsingResourcePanel(currentAppName || '', isProjectLevel)) {
      footer?.classList.add(moduleStyles.hiddenFooter);
    } else if (footer?.classList.contains(moduleStyles.hiddenFooter)) {
      footer.classList.remove(moduleStyles.hiddenFooter);
    }
  }, [currentAppName, isProjectLevel]);

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

  const extraLinksButtonRightOfFooter =
    levelProperties?.isProjectLevel &&
    (currentAppName === 'pythonlab' || currentAppName === 'weblab2');

  const LabView = properties.view;
  return (
    <AiChatDisabledProvider>
      <ProgressContainer key={currentAppName} appType={currentAppName}>
        <div
          id={`lab2-${currentAppName}`}
          className={moduleStyles.labContainer}
        >
          <Suspense fallback={<Loading isLoading={true} />}>
            <LabView
              levelProperties={levelProperties}
              initialSources={initialSources}
            />
          </Suspense>
          {!hideExtraLinks && levelId && (
            <ExtraLinks
              levelId={levelId}
              positionRightOfFooter={extraLinksButtonRightOfFooter}
            />
          )}
        </div>
      </ProgressContainer>
    </AiChatDisabledProvider>
  );
};

export default LabViewsRenderer;
