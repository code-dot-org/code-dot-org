import type {AilabSnapshot} from '@code-dot-org/ailab';
import React, {useCallback, useEffect, useRef} from 'react';

import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  DEFAULT_SOURCES,
  snapshotToSources,
  sourcesToSnapshot,
} from '../snapshotSources';
import {AilabLevelProperties, AilabProjectSources} from '../types';

import AilabView from './AilabView';

interface LoadedWork {
  levelId: number;
  snapshot: AilabSnapshot | undefined;
}

const AilabContainer: React.FC<LabProps<AilabLevelProperties>> = ({
  levelProperties,
}) => {
  const dispatch = useAppDispatch();
  const {currentSources, projectManager, loadError, updateSources} =
    useSources<AilabProjectSources>({
      levelProperties,
      defaultSources: DEFAULT_SOURCES,
    });

  // On the first render for a new level, currentSources still holds the
  // previous level's; they are this level's only once they arrive after
  // useSources clears them.
  const awaitingLevelId = useRef<number>();
  const loadedWork = useRef<LoadedWork>();
  if (!levelProperties.usesProjects) {
    loadedWork.current = {levelId: levelProperties.id, snapshot: undefined};
  } else if (!currentSources) {
    awaitingLevelId.current = levelProperties.id;
  } else if (awaitingLevelId.current === levelProperties.id) {
    loadedWork.current = {
      levelId: levelProperties.id,
      snapshot: sourcesToSnapshot(currentSources),
    };
    awaitingLevelId.current = undefined;
  }

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

  const saveSnapshot = useCallback(
    (snapshot: AilabSnapshot) => updateSources(snapshotToSources(snapshot)),
    [updateSources]
  );

  if (loadedWork.current?.levelId !== levelProperties.id) {
    return <Loading isLoading={true} />;
  }
  return (
    <AilabView
      levelProperties={levelProperties}
      initialSnapshot={loadedWork.current.snapshot}
      onStateChange={levelProperties.usesProjects ? saveSnapshot : undefined}
    />
  );
};

export default AilabContainer;
