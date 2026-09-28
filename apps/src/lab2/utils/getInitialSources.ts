import {START_SOURCES, TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {
  LevelProperties,
  MultiFileSource,
  ProjectSources,
} from '@cdo/apps/lab2/types';

const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isEditingExemplar = getAppOptionsEditingExemplar();
const isViewingExemplar = getAppOptionsViewingExemplar();

/**
 * A level's start, template or exemplar sources as ProjectSources. Levels
 * store these either as ProjectSources (Dance, Music, Sprite Lab) or as the
 * bare source (Web Lab 2, Python Lab); the two shapes differ on exactly one
 * key. A ProjectSources passes through unchanged.
 */
export function asProjectSources<T extends ProjectSources>(
  sources: ProjectSources | MultiFileSource | undefined
): T | undefined {
  if (!sources) return undefined;
  return ('source' in sources ? sources : {source: sources}) as T;
}

/**
 * The sources a level starts from: the saved project sources when there are
 * any, otherwise the level's own, subject to the level edit mode. Always
 * ProjectSources, or undefined when the level has none.
 */
export default function getInitialSources<T extends ProjectSources>(
  levelProperties: LevelProperties,
  projectSources?: T,
  toolboxEditSources?: T
): T | undefined {
  const startSources = asProjectSources<T>(levelProperties.startSources);
  const templateSources = asProjectSources<T>(levelProperties.templateSources);
  const exemplarSources = asProjectSources<T>(levelProperties.exemplarSources);
  const predictSettings = levelProperties.predictSettings;

  if (isStartMode) {
    return startSources;
  }

  if (isToolboxMode) {
    return asProjectSources<T>(toolboxEditSources);
  }

  if (isEditingExemplar || isViewingExemplar) {
    return exemplarSources;
  }

  if (
    predictSettings?.isPredictLevel &&
    !predictSettings?.codeEditableAfterSubmit
  ) {
    // Predict levels only use sources loaded from the server if the code is
    // editable after submit, otherwise use the start sources.
    return templateSources || startSources;
  }

  return projectSources || templateSources || startSources;
}

/**
 * The sources "start over" resets a project to: the level's own, subject to
 * the level edit mode, or `defaultSources` when the level has none.
 */
export function getStartOverSources<T extends ProjectSources>(
  levelProperties: LevelProperties,
  defaultSources: T,
  toolboxEditSources?: T
): T {
  if (isToolboxMode) {
    return asProjectSources<T>(toolboxEditSources) ?? defaultSources;
  }
  if (isStartMode) {
    return defaultSources;
  }
  return (
    asProjectSources<T>(levelProperties.templateSources) ||
    asProjectSources<T>(levelProperties.startSources) ||
    defaultSources
  );
}
