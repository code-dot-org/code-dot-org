import {DEFAULT_FOLDER_ID, MAZE_FILE_NAME} from '@codebridge/constants';
import {CodebridgeLevelProperties, MazeCell} from '@codebridge/types';
import {
  combineStartSourcesAndValidation,
  findFile,
  repairOpenFiles,
} from '@codebridge/utils';
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
import {getNextFileId} from '@cdo/apps/lab2/utils/multiFileSourceUtils';
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

export const useInitialSources = (
  defaultSources: ProjectSources,
  levelProperties: CodebridgeLevelProperties,
  initialServerSource: ProjectSources | undefined
) => {
  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const exemplarSources = levelProperties.exemplarSources as MultiFileSource;
  const startSources = levelProperties.startSources as MultiFileSource;
  const {
    serializedMaze,
    miniApp,
    validationFile,
    templateSources,
    predictSettings,
  } = levelProperties;

  const generateMazeFile = (mazeContents: MazeCell[][], fileId: string) => {
    return {
      id: fileId,
      name: MAZE_FILE_NAME,
      contents: JSON.stringify(mazeContents),
      type: ProjectFileType.SYSTEM_SUPPORT,
      language: 'txt',
      folderId: DEFAULT_FOLDER_ID,
    };
  };

  const repairedServerSource = useMemo(() => {
    // We have some old sources that may have an "active" file that is not in the list
    // of open files, due to duplication of the open property between the file and the openFiles array.
    // We repair this by ensuring the open files list contains the active file.
    if (initialServerSource) {
      return {
        ...initialServerSource,
        source: repairOpenFiles(initialServerSource.source as MultiFileSource),
      };
    }
    return initialServerSource;
  }, [initialServerSource]);

  const generateProjectSourceFromStartSource = useCallback(
    (startCode: MultiFileSource) => {
      // If we have a serialized maze, we need to add it to the project sources so
      // it is accessible when running/sharing/remixing the code. We save it as a
      // system support file.
      if (serializedMaze) {
        const mazeFileId = getNextFileId(Object.values(startCode.files));
        const mazeFile = generateMazeFile(serializedMaze, mazeFileId);
        startCode = {
          ...startCode,
          files: {
            ...startCode.files,
            [mazeFileId]: mazeFile,
          },
        };
      }
      startCode = repairOpenFiles(startCode);

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
      startSources
        ? generateProjectSourceFromStartSource(startSources)
        : undefined,
    [generateProjectSourceFromStartSource, startSources]
  );

  const templateStartSources: ProjectSources | undefined = useMemo(
    () =>
      templateSources
        ? generateProjectSourceFromStartSource(templateSources)
        : undefined,
    [generateProjectSourceFromStartSource, templateSources]
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
    if (
      predictSettings?.isPredictLevel &&
      !predictSettings?.codeEditableAfterSubmit
    ) {
      // Predict levels only use sources loaded from the server if the code is
      // editable after submit, otherwise use the start sources.
      return templateSources || startSources;
    }
    if (isEditingExemplar || isViewingExemplar) {
      // Show the existing exemplar sources when editing or viewing exemplar sources,
      // if they exist.
      if (exemplarSources) {
        const parsedExemplarSource: ProjectSources = {
          source: exemplarSources,
          labConfig: levelStartSources?.labConfig,
        };
        if (serializedMaze) {
          // If there is an existing maze file, we will replace it with the current maze.
          // Otherwise, we will create a new maze file.
          const existingMazeFile = findFile(
            exemplarSources,
            MAZE_FILE_NAME,
            DEFAULT_FOLDER_ID
          );
          const mazeFileId =
            existingMazeFile?.id ||
            getNextFileId(Object.values(exemplarSources.files));
          const mazeFile = generateMazeFile(serializedMaze, mazeFileId);
          parsedExemplarSource.source = {
            ...exemplarSources,
            files: {
              ...exemplarSources.files,
              [mazeFileId]: mazeFile,
            },
          };
        }
        return parsedExemplarSource;
      }
      // If we are viewing exemplars sources and have no exemplar, we show a fallback
      // page from LabViewsRenderer. We fall back to template sources, if they exist,
      // or the level's start sources for editing.
      return templateSources || startSources;
    }

    const projectSources = repairedServerSource;
    return projectSources || templateSources || startSources;
  }, [
    levelStartSources,
    parsedDefaultSources,
    templateStartSources,
    isStartMode,
    predictSettings?.isPredictLevel,
    predictSettings?.codeEditableAfterSubmit,
    isEditingExemplar,
    isViewingExemplar,
    repairedServerSource,
    exemplarSources,
    serializedMaze,
  ]);

  return {
    initialSources,
    levelStartSources,
    templateStartSources,
    parsedDefaultSources,
  };
};
