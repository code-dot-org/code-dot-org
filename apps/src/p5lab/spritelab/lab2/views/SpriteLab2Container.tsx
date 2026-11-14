import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {
  toolboxToWorkspaceBlocks,
  toolboxXmlToDefinition,
} from '@cdo/apps/blockly/utils/toolbox';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {
  getStandaloneProjectId,
  getAppOptionsEditBlocks,
  getIsLevelEditMode,
} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';
import getInitialSources from '@cdo/apps/lab2/utils/getInitialSources';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {unpackSources} from '../packedWorld';
import {withoutTopLevelSource} from '../topLevelSource';
import type {SpriteLab2LevelProperties, Sources} from '../types';

import SpriteLab2View from './SpriteLab2View';

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
const isLevelEditMode = getIsLevelEditMode();

/**
 * Returns the level's toolbox as workspace blocks, if in toolbox mode.
 * Uses the JSON definition if present, or falls back to and converts
 * the XML definition, if any.
 */
function getToolboxEditSources(
  levelProperties: SpriteLab2LevelProperties
): Sources | undefined {
  if (!isToolboxMode) {
    return undefined;
  }
  const {toolboxDefinition, toolboxBlocks} = levelProperties;
  let definition = toolboxDefinition;
  if (!definition && toolboxBlocks) {
    definition = toolboxXmlToDefinition(toolboxBlocks);
  }
  return {source: toolboxToWorkspaceBlocks(definition)};
}

// Saved flags for the block catalog and free play intro are not student
// edits: Continue and the Run/Edit prompt read hasEdited.
const CATALOG_KEYS: ReadonlySet<keyof Sources> = new Set<keyof Sources>([
  'chosenBlocks',
  'freeplayIntroSeen',
]);
const isStudentEdit = (prev: Sources, next: Sources) =>
  (Object.keys({...prev, ...next}) as (keyof Sources)[]).some(
    key => !CATALOG_KEYS.has(key) && prev[key] !== next[key]
  );

const SpriteLab2Container: React.FunctionComponent<
  LabProps<SpriteLab2LevelProperties, Sources>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  // A share link is play only, for its owner too.
  const isShareView = !!useAppSelector(state => state.lab.isShareView);
  const standaloneChannelId = useMemo(getStandaloneProjectId, []);

  useEffect(() => setupSpriteLab2BlocklyEnvironment(), []);

  // Must run before getToolboxEditSources is called (blocks must exist for XML-JSON conversion)
  useEffect(() => {
    installSharedBlocks(levelProperties.sharedBlocks || []);
  }, [levelProperties.sharedBlocks]);

  const [sourcesReinitializedCount, setSourcesReinitializedCount] = useState(0);
  const handleReinitialize = useCallback(
    () => setSourcesReinitializedCount(c => c + 1),
    []
  );
  const {
    currentSources: storedSources,
    updateSources: updateStoredSources,
    patchSources: patchStoredSources,
    channel,
    projectManager,
    loadError,
    ...restOutputs
  } = useSources<Sources>({
    levelProperties,
    defaultSources,
    // Without this a project page loads the visitor's own project for the
    // level, not the one in the address.
    standaloneChannelId,
    onReinitialize: handleReinitialize,
    getToolboxEditSources,
    computeHasEdited: isStudentEdit,
  });
  // A student on a level with no project (the no_project level property)
  // sees the level's own sources read-only; the lab's writes are dropped here
  // so none reaches a hook that may still hold the previous level.
  const readOnlyLevel =
    levelProperties.usesProjects === false && !isLevelEditMode;
  const levelSources = useMemo(
    () =>
      readOnlyLevel
        ? getInitialSources<Sources>(levelProperties) ??
          (defaultSources as Sources)
        : undefined,
    [readOnlyLevel, levelProperties]
  );
  // The hook keeps the last level's sources for the render in which the
  // level changes, until its load effect clears them. Those are not handed
  // to the view, which would otherwise mount once against them and again
  // against this level's.
  const loadedForRef = useRef<number>();
  if (storedSources === undefined) {
    loadedForRef.current = undefined;
  } else if (loadedForRef.current === undefined) {
    loadedForRef.current = levelProperties.id;
  }
  const storedForLevel =
    loadedForRef.current === levelProperties.id ? storedSources : undefined;
  const isViewOnly =
    !!levelProperties.isProjectLevel && !restOutputs.isEditable && !isShareView;
  // Such a level's start sources may write a scene's world in the packed
  // form (packedWorld.ts). It is expanded here, for readers and for the base
  // an updater builds on, so the rest of the lab only sees the grid.
  const currentSources = useMemo(() => {
    const sources = readOnlyLevel ? levelSources : storedForLevel;
    return sources && unpackSources(sources);
  }, [readOnlyLevel, levelSources, storedForLevel]);
  const updateSources = useCallback<typeof updateStoredSources>(
    (next, forceSave) => {
      if (readOnlyLevel || isShareView || isViewOnly) {
        return;
      }
      // A level being edited keeps its start sources as they are written.
      const tidy = isLevelEditMode
        ? (sources: Sources) => sources
        : withoutTopLevelSource;
      updateStoredSources(
        typeof next === 'function'
          ? prev => tidy(next(unpackSources(prev)))
          : tidy(next),
        forceSave
      );
    },
    [readOnlyLevel, isShareView, isViewOnly, updateStoredSources]
  );
  const patchSources = useCallback<typeof patchStoredSources>(
    (patch, forceSave) =>
      updateSources(prev => ({...prev, ...patch}), forceSave),
    [updateSources]
  );

  // Set the project manager in the registry for external components that need it (e.g. header).
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

  if (!currentSources) {
    return <Loading isLoading={true} />;
  }
  // One view per level: a level change remounts it, so no effect of the
  // last level runs against this one's sources.
  return (
    <SpriteLab2View
      key={levelProperties.id}
      currentSources={currentSources}
      updateSources={updateSources}
      patchSources={patchSources}
      levelProperties={levelProperties}
      channelId={channel?.id}
      sourcesReinitializedCount={sourcesReinitializedCount}
      {...restOutputs}
      isEditable={restOutputs.isEditable && !isShareView}
      isShareView={isShareView}
      isViewOnly={isViewOnly}
    />
  );
};

export default SpriteLab2Container;
