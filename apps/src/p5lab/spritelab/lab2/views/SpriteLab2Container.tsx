import {isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useState} from 'react';

import {
  toolboxToWorkspaceBlocks,
  toolboxXmlToDefinition,
} from '@cdo/apps/blockly/utils/toolbox';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import useSources from '@cdo/apps/lab2/hooks/useSources';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getAppOptionsEditBlocks} from '@cdo/apps/lab2/projects/utils';
import {LabProps} from '@cdo/apps/lab2/types';
import getInitialSources from '@cdo/apps/lab2/utils/getInitialSources';
import Loading from '@cdo/apps/lab2/views/Loading';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  installSharedBlocks,
  setupSpriteLab2BlocklyEnvironment,
} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {unpackSources} from '../packedWorld';
import type {SpriteLab2LevelProperties, Sources} from '../types';

import SpriteLab2View from './SpriteLab2View';

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

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

// The block catalog's bookkeeping is not a student edit: Continue and the
// Run/Edit prompt read hasEdited.
const CATALOG_KEYS: ReadonlySet<keyof Sources> = new Set<keyof Sources>([
  'chosenBlocks',
  'blockCatalogSeen',
]);
const isStudentEdit = (prev: Sources, next: Sources) =>
  (Object.keys({...prev, ...next}) as (keyof Sources)[]).some(
    key => !CATALOG_KEYS.has(key) && prev[key] !== next[key]
  );

const SpriteLab2Container: React.FunctionComponent<
  LabProps<SpriteLab2LevelProperties, Sources>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();

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
    startOver: startStoredOver,
    channel,
    projectManager,
    loadError,
    ...restOutputs
  } = useSources<Sources>({
    levelProperties,
    defaultSources,
    onReinitialize: handleReinitialize,
    getToolboxEditSources,
    computeHasEdited: isStudentEdit,
  });
  // A level with no project (the no_project level property) has nothing in
  // a channel. Its sources are the level's own, held here in memory: a
  // student sees them read-only, levelbuilder's start-sources mode edits
  // them, and nothing is ever saved to a project. A world in them may be
  // packed (packedWorld.ts); it is expanded once here, so the rest of the
  // lab only sees the grid.
  const projectless = levelProperties.usesProjects === false;
  const levelSources = useMemo(
    () =>
      projectless
        ? unpackSources(
            getInitialSources<Sources>(
              levelProperties,
              undefined,
              getToolboxEditSources(levelProperties)
            ) ?? (defaultSources as Sources)
          )
        : undefined,
    [projectless, levelProperties]
  );
  const [own, setOwn] = useState<{from?: Sources; sources?: Sources}>({});
  let ownSources = own.sources;
  if (own.from !== levelSources) {
    ownSources = levelSources;
    setOwn({from: levelSources, sources: levelSources});
  }
  const currentSources = projectless ? ownSources : storedSources;
  const updateSources = useCallback<typeof updateStoredSources>(
    (next, forceSave) => {
      if (!projectless) {
        updateStoredSources(next, forceSave);
        return;
      }
      setOwn(prev => {
        if (!prev.sources) {
          return prev;
        }
        const sources = typeof next === 'function' ? next(prev.sources) : next;
        return isEqual(sources, prev.sources) ? prev : {...prev, sources};
      });
    },
    [projectless, updateStoredSources]
  );
  const patchSources = useCallback<typeof patchStoredSources>(
    (patch, forceSave) =>
      updateSources(prev => ({...prev, ...patch}), forceSave),
    [updateSources]
  );
  const startOver = useCallback(() => {
    if (!projectless) {
      startStoredOver();
      return;
    }
    setOwn({from: levelSources, sources: levelSources});
    handleReinitialize();
  }, [projectless, startStoredOver, levelSources, handleReinitialize]);

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
      startOver={startOver}
      levelProperties={levelProperties}
      channelId={channel?.id}
      sourcesReinitializedCount={sourcesReinitializedCount}
      {...restOutputs}
    />
  );
};

export default SpriteLab2Container;
