/**
 * Configuration and management for rendering Lab views in Lab2, based on the
 * currently active Lab (determined by the current app name). This
 * helps facilitate level-switching between labs without page reloads.
 */
import React, {Suspense} from 'react';

import {getCurrentScriptLevelId} from '@cdo/apps/code-studio/progressReduxSelectors';
import {queryParams} from '@cdo/apps/code-studio/utils';
import {PERMISSIONS} from '@cdo/apps/lab2/constants';
import {useInitialLabTheme} from '@cdo/apps/lab2/hooks/useInitialLabTheme';
import ProgressContainer from '@cdo/apps/lab2/progress/ProgressContainer';
import {getAppOptionsViewingExemplar} from '@cdo/apps/lab2/projects/utils';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {lab2EntryPoints} from '../../../lab2EntryPoints';

import NoExemplarPage from './components/NoExemplarPage';
import ExtraLinks from './ExtraLinks';
import Loading from './Loading';

import moduleStyles from './lab-views-renderer.module.scss';

const hideExtraLinks = queryParams('hide-extra-links') === 'true';

const LabViewsRenderer: React.FunctionComponent = () => {
  const levelProperties = useAppSelector(state => state.lab.levelProperties);
  const initialSources = useAppSelector(state => state.lab.initialSources);

  const currentAppName = levelProperties?.appName;
  const exemplarSources = levelProperties?.exemplarSources;
  const levelId = levelProperties?.id;
  const scriptLevelId = useAppSelector(getCurrentScriptLevelId);

  const isBlockedAbuse = useAppSelector(state => state.lab.isBlockedAbuse);
  const projectSharingDisabled = useAppSelector(
    state => state.lab.projectSharingDisabled
  );
  const isTeacherOfProjectOwner = useAppSelector(
    state => state.lab.isTeacherOfProjectOwner
  );
  console.log('isTeacherOfProjectOwner', isTeacherOfProjectOwner);
  const isOwner = useAppSelector(state => state.lab.channel?.isOwner || false);
  const isProjectValidator = useAppSelector(state =>
    state.lab.permissions?.includes(PERMISSIONS.PROJECT_VALIDATOR)
  );

  const pathname = window.location.pathname;
  const tokens = pathname.split('/');
  let pageAction = 'share';
  if (tokens[1] === 'projects') {
    pageAction = tokens[4];
  }

  const isViewingExemplar = getAppOptionsViewingExemplar();

  useInitialLabTheme({
    currentAppName,
    levelProperties,
  });

  const isBlocked = isBlockedAbuse || projectSharingDisabled;

  const blockLabView = () => {
    if (!currentAppName || (pageAction === 'share' && isBlocked)) {
      return true;
    }
    if (['view', 'edit'].includes(pageAction)) {
      return !isProjectValidator && !isOwner && !isTeacherOfProjectOwner;
    }
    return false;
  };

  // Do not render lab view if project is blocked, and user is not a project validator nor owner, and in share view..
  if (blockLabView()) {
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
    <ProgressContainer key={currentAppName} appType={currentAppName}>
      <div id={`lab2-${currentAppName}`} className={moduleStyles.labContainer}>
        <Suspense fallback={<Loading isLoading={true} />}>
          <LabView
            levelProperties={levelProperties}
            initialSources={initialSources}
          />
        </Suspense>
        {!hideExtraLinks && levelId && (
          <ExtraLinks
            levelId={levelId}
            scriptLevelId={scriptLevelId}
            positionRightOfFooter={extraLinksButtonRightOfFooter}
          />
        )}
      </div>
    </ProgressContainer>
  );
};

export default LabViewsRenderer;
