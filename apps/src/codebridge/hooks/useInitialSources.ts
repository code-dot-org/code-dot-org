import {useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

/**
 * Custom hook that determines the initial sources for the current level.
 * It selects various sources including from the student's project, the start sources
 * of the level and its template level, and default sources in case none of the
 * others exist.
 * - If in start mode, return the level start sources or default sources.
 * - If editing or viewing exemplar sources, it returns the exemplar sources,
 *   template sources, start sources, or default sources in that order.
 * - Otherwise, in a normal student view, it prioritizes to the student project sources,
 *   template sources, start sources, or default sources in that order.
 *
 * @param {ProjectSources} defaultSources - The default sources to use if no other sources are found.
 * @returns {ProjectSources} - The initial sources to use.
 */

export const useInitialSources = (defaultSources: ProjectSources) => {
  const labInitialSources = useAppSelector(state => state.lab.initialSources);
  const levelStartSource = useAppSelector(
    state => state.lab.levelProperties?.startSources
  );
  const levelTemplateSource = useAppSelector(
    state => state.lab.levelProperties?.templateSources
  );

  const exemplarSources = useAppSelector(
    state => state.lab.levelProperties?.exemplarSources
  );
  // We memoize these objects so that they don't cause an unexpected re-render.
  const projectStartSource: ProjectSources | undefined = useMemo(
    () => (levelStartSource ? {source: levelStartSource} : undefined),
    [levelStartSource]
  );
  const templateStartSource: ProjectSources | undefined = useMemo(
    () => (levelTemplateSource ? {source: levelTemplateSource} : undefined),
    [levelTemplateSource]
  );

  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();

  const initialSources = useMemo(() => {
    const startSources = projectStartSource || defaultSources;
    const templateSources = templateStartSource;

    if (isStartMode) {
      return startSources;
    }
    if (isEditingExemplar || isViewingExemplar) {
      // If we are viewing exemplars sources and have no exemplar, we show a fallback
      // page from LabViewsRenderer. We fall back to template sources, if they exist,
      // or the level's start sources for editing.
      return exemplarSources
        ? {source: exemplarSources}
        : templateSources || startSources;
    }

    const projectSources = labInitialSources;
    return projectSources || templateSources || startSources;
  }, [
    projectStartSource,
    templateStartSource,
    defaultSources,
    isStartMode,
    isEditingExemplar,
    isViewingExemplar,
    labInitialSources,
    exemplarSources,
  ]);

  return initialSources;
};
