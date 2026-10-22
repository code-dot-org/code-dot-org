import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {type AilabProject} from '@cdo/apps/ailab/engine';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  AILAB_DEFAULT_SOURCES,
  type AilabProjectSources,
  sourceToProject,
} from '../sources';
import {AilabLevelProperties} from '../types';

import AilabWorkspace from './AilabWorkspace';

const AilabView: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const [reinitializedCount, setReinitializedCount] = useState(0);
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

  // External components reach the project manager through the registry.
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

  const savedProject = useMemo(
    () => (currentSources ? sourceToProject(currentSources.source) : undefined),
    [currentSources]
  );

  if (!currentSources || !savedProject) {
    return <Loading isLoading={true} />;
  }

  return (
    <AilabWorkspace
      key={reinitializedCount}
      levelProperties={levelProperties}
      hasEdited={hasEdited}
      savedProject={savedProject}
      save={save}
      startOver={startOver}
      projectManager={projectManager}
    />
  );
};

export default AilabView;
