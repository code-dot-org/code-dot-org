import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

// Hook for getting the initial sources for the current level.
// If we are in start mode, we show the start sources or the default sources
// if the level has no start sources.
// If the user has a project, we prioritize that over the start sources. If there is
// no project or start sources, we use the default sources.
export const useInitialSources = (defaultSources: ProjectSources) => {
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.source
  );
  const exemplarSources = useAppSelector(
    state => state.lab.levelProperties?.exemplarSources
  );
  // We memoize this object so that it doesn't cause an unexpected re-render.
  const projectStartSource: ProjectSources | undefined = useMemo(
    () => (levelStartSource ? {source: levelStartSource} : undefined),
    [levelStartSource]
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();

  const initialSources = useMemo(() => {
    const startSources = projectStartSource || defaultSources;

    if (isStartMode) {
      return startSources;
    }
    if (isEditingExemplar || isViewingExemplar) {
      // If we are viewing exemplars sources and have no exemplar, we show a fallback
      // page from LabViewsRenderer. We fall back to start sources for editing.
      return exemplarSources ? {source: exemplarSources} : startSources;
    }

    const projectSources = labInitialSources;
    return projectSources || startSources;
  }, [
    projectStartSource,
    defaultSources,
    isStartMode,
    isEditingExemplar,
    isViewingExemplar,
    labInitialSources,
    exemplarSources,
  ]);

  return initialSources;
};
