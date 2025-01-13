import {getNextFileId} from '@codebridge/codebridgeContext';
import {DEFAULT_FOLDER_ID} from '@codebridge/constants';
import {combineStartSourcesAndValidation} from '@codebridge/utils';
import {useCallback, useMemo} from 'react';

import {START_SOURCES} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  MultiFileSource,
  ProjectFileType,
  ProjectSources,
} from '@cdo/apps/lab2/types';
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
  const levelSource = useAppSelector(
    state => state.lab.levelProperties?.startSources
  );
  const templateSource = useAppSelector(
    state => state.lab.levelProperties?.templateSources
  );

  const exemplarSources = useAppSelector(
    state => state.lab.levelProperties?.exemplarSources
  );
  const validationFile = useAppSelector(
    state => state.lab.levelProperties?.validationFile
  );
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const serializedMaze = useAppSelector(
    state => state.lab.levelProperties?.serializedMaze
  );
  const miniApp = useAppSelector(state => state.lab.levelProperties?.miniApp);

  const generateProjectSourceFromStartSource = useCallback(
    (startCode: MultiFileSource) => {
      // If we have a serialized maze, we need to add it to the project sources so
      // it is accessible when running/sharing/remixing the code. We save it as a
      // system support file.
      if (serializedMaze) {
        const mazeFileId = getNextFileId(Object.values(startCode.files));
        const mazeFile = {
          id: mazeFileId,
          name: 'serialized_maze.txt',
          contents: JSON.stringify(serializedMaze),
          type: ProjectFileType.SYSTEM_SUPPORT,
          language: 'txt',
          folderId: DEFAULT_FOLDER_ID,
        };
        startCode = {
          ...startCode,
          files: {
            ...startCode.files,
            [mazeFileId]: mazeFile,
          },
        };
      }

      const source = isStartMode
        ? combineStartSourcesAndValidation(startCode, validationFile)
        : startCode;

      const labConfig = miniApp ? {miniApp: {name: miniApp}} : undefined;

      return {source, labConfig};
    },
    [isStartMode, miniApp, serializedMaze, validationFile]
  );

  // We memoize these objects so that they don't cause an unexpected re-render.
  const levelStartSources: ProjectSources | undefined = useMemo(
    () =>
      levelSource
        ? generateProjectSourceFromStartSource(levelSource)
        : undefined,
    [levelSource, generateProjectSourceFromStartSource]
  );

  const templateStartSources: ProjectSources | undefined = useMemo(
    () =>
      templateSource
        ? generateProjectSourceFromStartSource(templateSource)
        : undefined,
    [generateProjectSourceFromStartSource, templateSource]
  );

  const parsedDefaultSources = useMemo(
    () =>
      generateProjectSourceFromStartSource(
        defaultSources.source as MultiFileSource
      ),
    [defaultSources, generateProjectSourceFromStartSource]
  );

  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();

  const initialSources = useMemo(() => {
    const startSources = levelStartSources || parsedDefaultSources;
    const templateSources = templateStartSources;

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
    levelStartSources,
    parsedDefaultSources,
    templateStartSources,
    isStartMode,
    isEditingExemplar,
    isViewingExemplar,
    labInitialSources,
    exemplarSources,
  ]);

  return {
    initialSources,
    levelStartSources,
    templateStartSources,
    parsedDefaultSources,
  };
};
