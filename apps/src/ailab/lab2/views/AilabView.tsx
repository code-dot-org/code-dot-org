import React, {useCallback, useEffect, useRef, useState} from 'react';

import {type AilabProject} from '@cdo/apps/ailab/engine';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {AILAB_DEFAULT_SOURCES, type AilabProjectSources} from '../sources';
import {AilabLevelProperties} from '../types';

import AilabWorkspace from './AilabWorkspace';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const [reinitializedCount, setReinitializedCount] = useState(0);
  const [isWorkspaceLoading, setIsWorkspaceLoading] = useState(false);
  const handleReinitialize = useCallback(
    () => setReinitializedCount(count => count + 1),
    []
  );

  const {
    currentSources,
    projectManager,
    loadError,
    hasEdited,
    updateSources,
    startOver,
  } = useSources<AilabProjectSources>({
    levelProperties,
    defaultSources: AILAB_DEFAULT_SOURCES,
    onReinitialize: handleReinitialize,
  });

  useEffect(() => {
    if (projectManager) {
      Lab2Registry.getInstance().setProjectManager(projectManager);
    }
    return () => Lab2Registry.getInstance().clearProjectManager();
  }, [projectManager]);

  useEffect(() => {
    if (loadError) {
      dispatch(
        setPageError({errorMessage: 'Error loading project', error: loadError})
      );
    }
  }, [loadError, dispatch]);

  const save = useCallback(
    (project: AilabProject) =>
      updateSources(previous => ({...previous, source: project})),
    [updateSources]
  );

  const isLoading = !currentSources || isWorkspaceLoading;
  // The overlay leaves the workspace in the tab order; React 18's JSX has no inert.
  const workspaceRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (workspaceRef.current) {
      workspaceRef.current.inert = isLoading;
    }
  }, [isLoading]);

  return (
    <>
      {currentSources && (
        <div ref={workspaceRef} style={{display: 'contents'}}>
          <AilabWorkspace
            key={reinitializedCount}
            levelProperties={levelProperties}
            hasEdited={hasEdited}
            savedSource={currentSources.source}
            save={save}
            startOver={startOver}
            projectManager={projectManager}
            onLoadingChange={setIsWorkspaceLoading}
          />
        </div>
      )}
      <Loading isLoading={isLoading} />
    </>
  );
};

export default AilabView;
