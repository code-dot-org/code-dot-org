import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import {cloneDeep, isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {applyBlockIdOverrides} from '@cdo/apps/blockly/utils';
import {getCodeFromSerializedWorkspace} from '@cdo/apps/blockly/utils/workspace/getCode';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import StartOverDialog from '@cdo/apps/lab2/views/dialogs/dsco/StartOverDialog';
// p5lab/reducers is a CommonJS bundle of all the classic Sprite Lab slices;
// pull the ones the engine and image list need by key.
import * as p5labReducersModule from '@cdo/apps/p5lab/reducers';
import {
  isNameUnique,
  SET_INITIAL_ANIMATION_LIST,
  setAnimationName,
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import {cancelLocationSelection} from '@cdo/apps/p5lab/redux/locationPicker';
import {getSerializedAnimationList} from '@cdo/apps/p5lab/shapes';
import {getStore, registerReducers} from '@cdo/apps/redux';
import {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  uploadAssetToLevel,
  uploadAssetToProject,
  UploadImageFunction,
} from '../ai/images/imageGeneration';
import {PLAY_MUSIC_BLOCK_TYPE} from '../blockly/blockDefinitions/playMusic';
import {setExternalSceneRefreshHandler} from '../blockly/externalSceneDropdown';
import {refreshAnimationDropdownThumbnails} from '../blockly/imagePickerFields';
import defaultSources from '../defaultSources.json';
import {countImagesByType, useGuideSteps} from '../guideSteps';
import {
  removeImageReferences,
  removeImageReferencesOnWorkspace,
  renameImageReferences,
  renameImageReferencesOnWorkspace,
} from '../imageReferences';
import {onTrimsUpdated} from '../imageTrim';
import {
  migrateAnimationList,
  migrateBlockTypes,
  migrateScenes,
} from '../migrateSources';
import {
  collectSavedSongs,
  fetchMusicProjects,
  withUnavailableSongs,
} from '../musicProjects';
import reseedablePageConstants, {
  RESET_PAGE_CONSTANTS,
} from '../redux/reseedablePageConstants';
import spriteLab2Reducer, {
  ExternalSceneOption,
  MusicProjectOption,
  resetSpriteLab2,
  setActiveTab,
  setExternalScenes,
  setMusicProjects,
  setScenes,
  ALL_TABS,
  Tab,
} from '../redux/spriteLab2Redux';
import {
  collectSavedExternalKeys,
  ExternalProject,
  fetchExternalProject,
  fetchSectionScenes,
  parseExternalSceneKey,
  toExternalSceneOptions,
} from '../scenesApi';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {SpriteLab2LevelProperties, Scene, Sources} from '../types';
import {
  compileWorldPrelude,
  DEFAULT_SCENE_GRID_SIZE,
  paintWorldCell,
  resizeWorld,
  sceneGridSize,
  World,
  WorldCell,
} from '../world';

import {isPointerClick} from './blurAfterPointerClick';
import SceneMusicBar from './components/SceneMusicBar';
import TabShell from './components/TabShell';
import GenerateImagePane from './GenerateImagePane';
import GenerateSpriteLab from './GenerateSpriteLab';
import Playspace, {PlayspaceMode} from './Playspace';
import SceneSelector from './SceneSelector';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';
import useSceneMusic from './useSceneMusic';
import WorldTab from './WorldTab';

import moduleStyles from './sprite-lab2-view.module.scss';

const p5labReducers = p5labReducersModule as unknown as Record<string, Reducer>;

// Legacy slices the reused engine and image list read from the shared
// getStore() store. (The classic AnimationTab/Piskel slices aren't used.)
registerReducers({
  animationList: p5labReducers.animationList,
  textConsole: p5labReducers.textConsole,
  spritelabInputList: p5labReducers.spritelabInputList,
  // Read/written by the location-picker block.
  locationPicker: p5labReducers.locationPicker,
  runState,
  pageConstants: reseedablePageConstants,
  spriteLab2: spriteLab2Reducer,
});

const ENABLED_TABS: readonly Tab[] = ['Images', 'Code', 'Play'];
const WORLD_TABS: readonly Tab[] = ['Images', 'World', 'Code', 'Play'];

// World-tab experiment flag: ?world-tab=true shows the tab (levels can also
// opt in via showWorldTab).
function getWorldTabEnabledParam() {
  return (
    new URLSearchParams(window.location.search).get('world-tab') === 'true'
  );
}

const DEFAULT_SCENE_SOURCE = defaultSources.source;
const DEFAULT_SCENE_ID = 'scene-1';

// How long workspace injection may wait on a fetched dropdown list.
const LIST_FETCH_TIMEOUT_MS = 5000;

// Saved sources are migrated in place as they are read (see migrateSources);
// the next save persists the result.
function getScenes(sources: Sources): Scene[] {
  if (sources.scenes?.length) {
    migrateScenes(sources.scenes);
    return sources.scenes;
  }
  // Create a default scene from the project's source for projects that don't have scenes already.
  migrateBlockTypes(sources.source);
  return [
    {
      id: DEFAULT_SCENE_ID,
      name: 'Scene 1',
      source: (sources.source ??
        DEFAULT_SCENE_SOURCE) as WorkspaceSerialization,
    },
  ];
}

// Debounce between a workspace edit and the live-preview re-run.
const RUN_DEBOUNCE_MS = 400;

// Sprites come from the Images tab, so a new project starts with no
// animations.
const EMPTY_ANIMATION_LIST = {orderedKeys: [], propsByKey: {}};

// Focused controls own the game keys pressed on them (see the
// swallowOnControls effect).
const INTERACTIVE_CONTROLS = 'button, a, input, select, textarea';

// The keys a game typically reads (p5 listens for them on window).
const GAME_KEYS = new Set([
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowDown',
  ' ',
  'Spacebar',
]);

// Levelbuilder edit modes (start, toolbox, exemplar) run without a project
// channel; generated images upload to the level's starter assets instead.
const isLevelEditMode =
  !!getAppOptionsEditBlocks() || !!getAppOptionsEditingExemplar();
const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

interface SpriteLab2ViewProps {
  levelProperties: SpriteLab2LevelProperties;
  currentSources: Sources;
  updateSources: UseSourcesOutput<Sources>['updateSources'];
  patchSources: UseSourcesOutput<Sources>['patchSources'];
  channelId?: string;
  hasEdited: boolean;
  startOver: () => void;
  isEditable: boolean;
  // Used for keying effects off of sources reinitializing.
  sourcesReinitializedCount: number;
}

const SpriteLab2View: React.FunctionComponent<SpriteLab2ViewProps> = ({
  levelProperties,
  currentSources,
  updateSources,
  patchSources,
  channelId,
  hasEdited,
  startOver,
  isEditable,
  sourcesReinitializedCount,
}) => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();

  const activeTab = useAppSelector(state => state.spriteLab2.activeTab);
  const worldTabParamEnabled = useMemo(getWorldTabEnabledParam, []);
  // A level can name its exact tab set; unknown names are dropped, and a list
  // naming none falls back to the defaults. Listing 'World' turns the world
  // tab on, as the URL flag and showWorldTab still do.
  const tabs = useMemo(() => {
    // The property is authored JSON, so its type is a claim, not a guarantee.
    const requested = levelProperties.visibleTabs?.filter(tab =>
      ALL_TABS.includes(tab)
    );
    if (requested?.length) {
      return requested;
    }
    return worldTabParamEnabled || levelProperties.showWorldTab
      ? WORLD_TABS
      : ENABLED_TABS;
  }, [
    levelProperties.visibleTabs,
    levelProperties.showWorldTab,
    worldTabParamEnabled,
  ]);
  const worldTabEnabled = tabs.includes('World');
  // Playfield size for a world this level creates. An existing world keeps
  // the size its grid already holds unless it can grow into this one without
  // dropping a placement (see resizeWorld) — the project's world is shared
  // across the levels that open its channel, so the data decides.
  const seedSceneSize =
    levelProperties.worldGridSize || DEFAULT_SCENE_GRID_SIZE;
  const worldFor = useCallback(
    (scene?: Scene) => resizeWorld(scene?.world, seedSceneSize),
    [seedSceneSize]
  );
  // A level naming its tabs opens on the list's first entry (display order is
  // fixed, so authored order is free to carry the start tab).
  useEffect(() => {
    if (levelProperties.visibleTabs?.length) {
      dispatch(setActiveTab(tabs[0]));
    }
    // Only the level identity should re-trigger the start tab.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelProperties.id, dispatch]);
  // The slice's initial tab is 'Code'; a level hiding Code (an images-only
  // level, say) needs the selection steered onto a tab that exists.
  useEffect(() => {
    if (!tabs.includes(activeTab)) {
      dispatch(setActiveTab(tabs.includes('Code') ? 'Code' : tabs[0]));
    }
  }, [tabs, activeTab, dispatch]);
  // The Images tab mounts once (idle pre-mount after seeding, or first
  // visit) and stays mounted clipped, so no visit pays the mount cost.
  const [imagesMounted, setImagesMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'Images') {
      setImagesMounted(true);
    }
  }, [activeTab]);
  // Same for the World tab: inserting its grid costs far more than rendering
  // it, because the consent script's autoblocker walks every added node.
  const [worldMounted, setWorldMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'World') {
      setWorldMounted(true);
    }
  }, [activeTab]);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  const isRunning = useAppSelector(state => state.runState.isRunning);
  const hasRun = useAppSelector(state => state.spriteLab2.hasRun);
  const blocklySettings = useBlocklySettings();
  const themeSetting = useThemeSetting('spritelab');
  // Seed the page constants the animationList logic + engine read (we bypass
  // StudioApp.init) and the AichatContextManager the aiGateway calls read.
  useEffect(() => {
    AichatContextManager.setContext({
      clientType: AiChatClientTypes.FLOW_LAB,
      currentLevelId: currentLevelId ? parseInt(currentLevelId, 10) : null,
      scriptId: scriptId ?? null,
      channelId,
    });
    dispatch(
      setPageConstants({
        isBlockly: true,
        isShareView: false,
        channelId,
      })
    );
    return () => {
      dispatch({type: RESET_PAGE_CONSTANTS});
    };
  }, [dispatch, channelId, currentLevelId, scriptId]);

  // Blocks rendered before an image finished trimming show the untrimmed
  // thumbnail; refresh the costume dropdowns as trims land.
  useEffect(() => onTrimsUpdated(refreshAnimationDropdownThumbnails), []);

  // Sources as of level load: seeding and engine creation are once-per-level
  // (the container remounts this view per level, after sources load).
  const initialSources = useRef(currentSources).current;

  const uploadImage: UploadImageFunction | undefined = useMemo(() => {
    if (channelId) {
      return (filename, data, mediaType) =>
        uploadAssetToProject(channelId, filename, data, mediaType);
    }
    if (isLevelEditMode) {
      const levelName = levelProperties.name;
      return (filename, data, mediaType) =>
        uploadAssetToLevel(levelName, filename, data, mediaType);
    }
    return undefined;
  }, [channelId, levelProperties.name]);

  const engineRef = useRef<SpriteLab2Engine | null>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [animationsSeeded, setAnimationsSeeded] = useState(false);
  // Jump transition: the cover blanks the playspace while the target loads;
  // fadeTrigger increments on landing to play the fade-from-black.
  const [jumpCover, setJumpCover] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(0);
  const [showStartOver, setShowStartOver] = useState(false);

  // Idle pre-mount (see imagesMounted above).
  useEffect(() => {
    if (!animationsSeeded || imagesMounted) {
      return;
    }
    if (typeof window.requestIdleCallback === 'function') {
      const handle = window.requestIdleCallback(() => setImagesMounted(true), {
        timeout: 3000,
      });
      return () => window.cancelIdleCallback(handle);
    }
    const handle = window.setTimeout(() => setImagesMounted(true), 1500);
    return () => window.clearTimeout(handle);
  }, [animationsSeeded, imagesMounted]);

  const scenes = useMemo(() => getScenes(currentSources), [currentSources]);
  const sceneMetadata = useMemo(
    () => scenes.map(s => ({id: s.id, name: s.name})),
    [scenes]
  );

  // Create the pinned scene on first load, and again after
  // Start Over (the reinit count in the deps). On a scene-less project the
  // pin becomes the only scene — materializing the synthesized default too
  // would leave a stray "Scene 1" in every level sharing the project.
  const {pinnedSceneId, pinnedSceneName} = levelProperties;
  useEffect(() => {
    if (!pinnedSceneId) {
      return;
    }
    updateSources(prev => {
      if (prev.scenes?.some(s => s.id === pinnedSceneId)) {
        return prev;
      }
      const pinned: Scene = {
        id: pinnedSceneId,
        name: pinnedSceneName || 'Scene',
        source: DEFAULT_SCENE_SOURCE,
      };
      const existing =
        prev.scenes?.length ||
        (prev.source && !isEqual(prev.source, DEFAULT_SCENE_SOURCE))
          ? getScenes(prev)
          : [];
      return {...prev, scenes: [...existing, pinned]};
    });
  }, [
    pinnedSceneId,
    pinnedSceneName,
    updateSources,
    sourcesReinitializedCount,
  ]);

  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => pinnedSceneId ?? scenes[0].id
  );
  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0];
  const activeWorld = worldFor(activeScene);
  const activeSceneSize = sceneGridSize(activeWorld);
  // The project's images, for guide steps waiting on some being made.
  const animationList = useAppSelector(state => state.animationList);

  // Keep activeSceneId pointing at a real scene: locked to the pin once the
  // ensure effect lands it, otherwise reset to the first scene when the
  // active one disappears (e.g. code cleared via start over).
  useEffect(() => {
    if (pinnedSceneId) {
      if (
        activeSceneId !== pinnedSceneId &&
        scenes.some(s => s.id === pinnedSceneId)
      ) {
        setActiveSceneId(pinnedSceneId);
      }
      return;
    }
    if (!scenes.some(s => s.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId, pinnedSceneId]);

  // Where Play begins with no explicit start scene: the pinned scene on a
  // pinned-scene level (the first scene may belong to another level sharing
  // the project), otherwise the first scene.
  const defaultPlaySceneId = pinnedSceneId ?? scenes[0]?.id ?? null;

  // From load-time sources, not the store: the redux list seeds a tick
  // after mount, so its first value would snapshot as empty.
  const baselineImages = useMemo(
    () =>
      countImagesByType(
        initialSources.animations ?? {orderedKeys: [], propsByKey: {}}
      ),
    [initialSources]
  );
  const guide = useGuideSteps({
    steps: levelProperties.guideSteps,
    grid: activeWorld.grid,
    activeTab,
    animations: animationList,
    baselineImages,
    fallback: levelProperties.longInstructions,
  });

  // The World palette selection lives here so it survives leaving the tab
  // (WorldTab unmounts when hidden).
  const [worldPaletteSelection, setWorldPaletteSelection] = useState<
    WorldCell | 'erase' | null
  >(null);

  // Store scenes in redux for Blockly dropdowns and AI prompt.
  // TODO: does this need to live in redux?
  useEffect(() => {
    dispatch(setScenes(sceneMetadata));
  }, [sceneMetadata, dispatch]);

  // Cleanup on level switch.
  useEffect(() => {
    return () => {
      dispatch(resetSpriteLab2());
      dispatch(cancelLocationSelection() as AnyAction);
    };
  }, [levelProperties.id, dispatch]);

  // Seed the redux animation list from a sources animations value.
  const seedAnimationList = useCallback(
    (animations: Sources['animations']) => {
      // Deep-cloned: the legacy thunk normalizes its argument IN PLACE, and
      // this object belongs to the sources state. The clone is also what the
      // migration rewrites; the next save persists the result.
      const seeded = cloneDeep(animations || EMPTY_ANIMATION_LIST);
      migrateAnimationList(seeded);
      dispatch(
        setInitialAnimationList(
          seeded,
          // No v3 migration; the engine never runs the legacy share path.
          undefined as unknown as object,
          true /* isSpriteLab */
        )
      );
    },
    [dispatch]
  );

  // Set when the seeding effect fetched the songs itself (saved blocks
  // needed them before the workspace), so they are not fetched twice.
  const musicSeededRef = useRef(false);

  // Seed the animation list BEFORE the workspace injects: dropdown fields
  // validate saved values against the store at block-load time — hence the
  // animationsSeeded gate on useBlocklyWorkspace, not just dispatch ordering.
  // Once per level: React Fast Refresh re-runs this effect, and re-seeding
  // from the load-time list would revert every image made since.
  const seededLevelRef = useRef<number | null>(null);
  useEffect(() => {
    if (seededLevelRef.current === levelProperties.id) {
      return;
    }
    seededLevelRef.current = levelProperties.id;
    let cancelled = false;
    seedAnimationList(initialSources.animations);
    // Workspace injection only waits on a fetched list (section scenes, the
    // user's songs) when saved blocks hold values from it; the gated path
    // times out into placeholder options so a hung API can't blank the lab.
    const savedExternalKeys = collectSavedExternalKeys(
      getScenes(initialSources)
    );
    const savedSongs = collectSavedSongs(getScenes(initialSources));
    const withTimeout = <T,>(fetching: Promise<T>): Promise<T> =>
      Promise.race([
        fetching,
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('timeout')), LIST_FETCH_TIMEOUT_MS)
        ),
      ]);
    const externalOptions = async (
      timed: boolean
    ): Promise<ExternalSceneOption[]> => {
      try {
        const fetching = fetchSectionScenes(levelProperties.id, scriptId);
        const refs = await (timed ? withTimeout(fetching) : fetching);
        return toExternalSceneOptions(refs);
      } catch (e) {
        console.warn('section scenes unavailable', e);
        return [];
      }
    };
    const musicOptions = async (): Promise<MusicProjectOption[]> => {
      try {
        return await withTimeout(fetchMusicProjects());
      } catch (e) {
        console.warn('music projects unavailable', e);
        return [];
      }
    };
    if (savedExternalKeys.length === 0 && savedSongs.length === 0) {
      setAnimationsSeeded(true);
      // Nothing waits on this list, so a slow response is simply used
      // whenever it lands instead of being discarded at the timeout.
      externalOptions(false).then(options => {
        if (!cancelled) {
          dispatch(setExternalScenes(options));
        }
      });
    } else {
      musicSeededRef.current = true;
      Promise.all([externalOptions(true), musicOptions()]).then(
        ([external, music]) => {
          if (cancelled) {
            return;
          }
          const known = new Set(external.map(o => o.key));
          savedExternalKeys.forEach(key => {
            if (!known.has(key)) {
              external.push({
                key,
                label: `(unavailable) #${key.slice(0, 10)}`,
              });
            }
          });
          dispatch(setExternalScenes(external));
          dispatch(setMusicProjects(withUnavailableSongs(music, savedSongs)));
          setAnimationsSeeded(true);
        }
      );
    }
    return () => {
      cancelled = true;
    };
    // Re-seeds only when the level changes (seedAnimationList is stable,
    // initialSources is a ref-captured constant).
  }, [
    levelProperties.id,
    scriptId,
    dispatch,
    initialSources,
    seedAnimationList,
  ]);

  // What's on stage right now — updated by every run, including scene jumps —
  // so "Restart scene" (and the reseed watcher below) can re-run it.
  const currentPlayingRef = useRef<
    | {kind: 'local'; scene: Scene}
    | {kind: 'external'; project: ExternalProject; sceneId: string}
    | null
  >(null);

  // Re-run the stage once a reseeded animation list finishes loading. The
  // reseed-triggered run happens immediately, but reseeded entries carry
  // only a sourceUrl (dataURIs load async) and the engine can't draw
  // unloaded images (costume/background commands no-op on unknown names —
  // a blank playspace until the next run). Thumbnails self-heal without
  // this: GenerateImagePane re-trims on every list change. Kept in a ref
  // (not effect cleanup): the reseed effect's deps churn on every animation
  // write, which would cancel a pending watcher mid-load.
  const cancelRerunWatchRef = useRef<() => void>();
  // Latest restart-scene handler, for the watcher's async callback.
  const restartSceneRef = useRef<() => void>(() => {});
  useEffect(() => () => cancelRerunWatchRef.current?.(), []);
  const rerunWhenAnimationsLoaded = useCallback(() => {
    cancelRerunWatchRef.current?.();
    const store = getStore();
    const allLoaded = () => {
      const list = store.getState().animationList;
      return list.orderedKeys.every(
        (key: string) => list.propsByKey[key]?.loadedFromSource
      );
    };
    if (allLoaded()) {
      // The reseed-triggered run has everything it needs.
      return;
    }
    const finish = () => {
      cancel();
      restartSceneRef.current();
    };
    const unsubscribe = store.subscribe(() => allLoaded() && finish());
    // Give up quietly if a load never completes; the playspace stays stale,
    // no worse than not watching.
    const timer = window.setTimeout(() => cancel(), 10000);
    const cancel = () => {
      unsubscribe();
      clearTimeout(timer);
      if (cancelRerunWatchRef.current === cancel) {
        cancelRerunWatchRef.current = undefined;
      }
    };
    cancelRerunWatchRef.current = cancel;
  }, []);

  // Reseed the animation list when sources are reinitialized (e.g. start over).
  const seededReinitCountRef = useRef(0);
  useEffect(() => {
    if (sourcesReinitializedCount === seededReinitCountRef.current) {
      return;
    }
    seededReinitCountRef.current = sourcesReinitializedCount;
    seedAnimationList(currentSources.animations);
    // The stage's scene belongs to the pre-reset sources; restart-scene
    // falls back to the first scene.
    currentPlayingRef.current = null;
    rerunWhenAnimationsLoaded();
  }, [
    sourcesReinitializedCount,
    currentSources.animations,
    seedAnimationList,
    rerunWhenAnimationsLoaded,
  ]);

  // Instantiate the engine once per level. No legacy default-sprite library:
  // images come from the Images tab, so p5 preload completes immediately.
  useEffect(() => {
    if (isToolboxMode) {
      // Toolbox editing has nothing to run: the workspace holds the toolbox
      // itself. With no engine, the run machinery no-ops.
      return;
    }
    let cancelled = false;
    const savedAnimations = initialSources.animations || EMPTY_ANIMATION_LIST;

    const setup = async () => {
      const engine = new SpriteLab2Engine(savedAnimations);
      await engine.initForLevel(levelProperties);
      if (cancelled) {
        engine.destroy();
        return;
      }
      engineRef.current = engine;
      setEngineReady(true);
    };

    setup();

    return () => {
      cancelled = true;
      setEngineReady(false);
      engineRef.current?.destroy();
      engineRef.current = null;
    };
  }, [levelProperties, initialSources]);

  // Persist Images-tab changes back to sources in the serialized shape.
  useEffect(() => {
    // Serialize from the LIVE store, not this commit's snapshot: this effect
    // runs after compileExternalScene's synchronous merge-and-restore, and a
    // snapshot save would leak the classmate's costumes into sources.
    patchSources({
      animations: getSerializedAnimationList(
        getStore().getState().animationList
      ),
    });
  }, [animationList, patchSources]);

  const {
    getCode,
    getCurrentBlocks,
    getToolboxDefinition,
    loadCode,
    subscribeToChanges,
    refreshToolbox,
  } = useBlocklyWorkspace({
    enabled: animationsSeeded,
    toolboxDefinition: levelProperties.toolboxDefinition,
    sharedBlocks: levelProperties.sharedBlocks,
    theme,
  });

  const WorkspaceAlert = useLevelEditMode<SpriteLab2LevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          // The workspace holds the toolbox laid out as blocks; serialize it
          // back into the level's toolbox definition.
          const toolboxDefinition = getToolboxDefinition();
          return toolboxDefinition
            ? {toolbox_definition: toolboxDefinition}
            : {};
        }
        const sources = cloneDeep(currentSources);
        if (mode === 'start' && Blockly.blockIdOverrides) {
          // Apply Block ID overrides for top-level sources and all scenes.
          [
            sources.source as WorkspaceSerialization | undefined,
            ...(sources.scenes ?? []).map(scene => scene.source),
          ].forEach(source => {
            if (source) {
              applyBlockIdOverrides(source, Blockly.blockIdOverrides);
            }
          });
        }
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']: sources,
        };
      },
      [currentSources, getToolboxDefinition]
    )
  );

  // The active scene's world, by ref: run callbacks read it at call time,
  // so world edits don't churn their identities.
  const activeWorldRef = useRef<World | undefined>(undefined);
  useEffect(() => {
    activeWorldRef.current = worldFor(activeScene);
  }, [activeScene, worldFor]);

  // Run the current program as the live preview (cheap: the engine reuses p5).
  const runProgram = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    dispatch(setIsRunning(true));
    engine.runProgram(
      compileWorldPrelude(activeWorldRef.current) + (getCode() ?? '')
    );
  }, [dispatch, getCode]);

  // Debounce re-runs so we don't restart the program on every keystroke/drag.
  const runTimer = useRef<number>();
  const scheduleRun = useCallback(() => {
    if (runTimer.current) {
      window.clearTimeout(runTimer.current);
    }
    runTimer.current = window.setTimeout(runProgram, RUN_DEBOUNCE_MS);
  }, [runProgram]);

  // Run one scene: the open scene compiles from the live workspace, others
  // headless from saved sources. Cover/fade comes from the engine's jump
  // callbacks, not here — editor/tab switches don't fade.
  const runLocalScene = useCallback(
    (scene: Scene) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      // Running a local scene leaves any external-project context behind.
      currentExternalProjectRef.current = null;
      engine.preloadAnimationsOverride = null;
      currentPlayingRef.current = {kind: 'local', scene};
      const prelude = compileWorldPrelude(worldFor(scene));
      let code = '';
      try {
        const live = scene.id === activeSceneId ? getCode() : null;
        code =
          live ??
          getCodeFromSerializedWorkspace(scene.source ?? DEFAULT_SCENE_SOURCE);
      } catch (e) {
        // A scene that fails to compile shouldn't kill the jump entirely;
        // run it as an empty scene.
        console.error('Failed to compile scene', scene.id, e);
      }
      dispatch(setIsRunning(true));
      engine.runProgram(prelude + code);
    },
    [dispatch, activeSceneId, getCode, worldFor]
  );

  const runScene = useCallback(
    (sceneId: string | null) => {
      const scene = scenes.find(s => s.id === sceneId);
      if (!scene) {
        // If a jump triggered this, resume the old scene instead of leaving
        // it frozen.
        engineRef.current?.cancelSceneJump();
        return;
      }
      runLocalScene(scene);
    },
    [scenes, runLocalScene]
  );

  // --- External scenes (cross-project jumps) ---
  const externalProjectsRef = useRef(new Map<string, ExternalProject>());
  // The external project whose scene is currently running; its own go-to-scene
  // blocks resolve against this.
  const currentExternalProjectRef = useRef<ExternalProject | null>(null);
  const [externalLoading, setExternalLoading] = useState(false);

  // The external scene's dropdowns validate against the redux lists at
  // block-load time, so merge its animations/scenes in for the synchronous
  // compile and restore after. RAW action, not the thunk — the thunk
  // re-fetches every image per dispatch (a fetch storm across jumps) — and
  // restoring the captured state object keeps selectors reference-equal.
  const compileExternalScene = useCallback(
    (scene: Scene, project: ExternalProject) => {
      const currentAnimations = getStore().getState().animationList;
      const theirs = project.animations;
      const merged = {
        orderedKeys: [
          ...currentAnimations.orderedKeys,
          ...(theirs.orderedKeys || []).filter(
            (k: string) => !currentAnimations.propsByKey[k]
          ),
        ],
        propsByKey: {
          ...(theirs.propsByKey || {}),
          ...currentAnimations.propsByKey,
        },
      };
      const currentSceneMetadata = sceneMetadata;
      dispatch({type: SET_INITIAL_ANIMATION_LIST, animationList: merged});
      // Dedupe: the external project can be the user's own (a jump back into
      // this project), and duplicate ids break the selector's list rendering.
      const knownSceneIds = new Set(currentSceneMetadata.map(s => s.id));
      dispatch(
        setScenes([
          ...currentSceneMetadata,
          ...project.scenes
            .filter(s => !knownSceneIds.has(s.id))
            .map(s => ({id: s.id, name: s.name})),
        ])
      );
      try {
        return getCodeFromSerializedWorkspace(
          scene.source ?? DEFAULT_SCENE_SOURCE
        );
      } finally {
        dispatch({
          type: SET_INITIAL_ANIMATION_LIST,
          animationList: currentAnimations,
        });
        dispatch(setScenes(currentSceneMetadata));
      }
    },
    [dispatch, sceneMetadata]
  );

  const runExternalProjectScene = useCallback(
    (project: ExternalProject, sceneId: string) => {
      const engine = engineRef.current;
      const scene = project.scenes.find(s => s.id === sceneId);
      if (!engine || !scene) {
        engineRef.current?.cancelSceneJump();
        return;
      }
      currentExternalProjectRef.current = project;
      currentPlayingRef.current = {kind: 'external', project, sceneId};
      // An external scene runs at the playfield size ITS project authored —
      // reshaping it to this level's size would resize every cell under a
      // layout built for the other one.
      const prelude = compileWorldPrelude(scene.world);
      let code = '';
      try {
        code = compileExternalScene(scene, project);
      } catch (e) {
        console.error('Failed to compile external scene', sceneId, e);
      }
      // Preload the external project's images. Their saved animations carry
      // sourceUrl (dataURI is stripped on save); p5.loadImage takes URLs too.
      const theirs = project.animations;
      engine.preloadAnimationsOverride = {
        orderedKeys: theirs.orderedKeys || [],
        propsByKey: Object.fromEntries(
          Object.entries(theirs.propsByKey || {}).map(([key, props]) => [
            key,
            {...props, dataURI: props.sourceUrl},
          ])
        ),
      };
      dispatch(setIsRunning(true));
      engine.runProgram(prelude + code);
    },
    [dispatch, compileExternalScene]
  );

  // Fetch the classmate's project fresh (their scenes may have changed);
  // the last good copy is only a fetch-failure fallback.
  const runExternalScene = useCallback(
    async (key: string) => {
      const parsed = parseExternalSceneKey(key);
      if (!parsed) {
        engineRef.current?.cancelSceneJump();
        return;
      }
      setExternalLoading(true);
      let project: ExternalProject | undefined;
      try {
        project = await fetchExternalProject(
          parsed.channel,
          levelProperties.id,
          scriptId
        );
        migrateScenes(project.scenes);
        externalProjectsRef.current.set(parsed.channel, project);
      } catch (e) {
        project = externalProjectsRef.current.get(parsed.channel);
        if (!project) {
          console.error('Failed to load external scene', key, e);
          engineRef.current?.cancelSceneJump();
          return;
        }
        console.warn('Using last-loaded copy of external scene', key, e);
      } finally {
        setExternalLoading(false);
      }
      runExternalProjectScene(project, parsed.sceneId);
    },
    [runExternalProjectScene, levelProperties.id, scriptId]
  );

  // The external dropdown re-fetches the section list on every open, so
  // scenes classmates add while this lab is open show up.
  useEffect(() => {
    setExternalSceneRefreshHandler(async () => {
      const refs = await fetchSectionScenes(levelProperties.id, scriptId);
      const options = toExternalSceneOptions(refs);
      const known = new Set(options.map(o => o.key));
      collectSavedExternalKeys(scenes).forEach(key => {
        if (!known.has(key)) {
          options.push({key, label: `(unavailable) #${key.slice(0, 10)}`});
        }
      });
      dispatch(setExternalScenes(options));
    });
    return () => setExternalSceneRefreshHandler(null);
  }, [levelProperties.id, scriptId, dispatch, scenes]);

  // Scene jumps should only navigate while playing. In preview (Code tab) a
  // goToScene block would otherwise pull the preview off the scene being edited.
  // The handlers below are wired once, so they read the live mode through a ref.
  const isPlayingRef = useRef(activeTab === 'Play');
  useEffect(() => {
    isPlayingRef.current = activeTab === 'Play';
  }, [activeTab]);

  // The play-music block's songs, fetched once per level. The flyout
  // usually renders first: it is redrawn with them, and a block placed
  // meanwhile, holding no song, is given the newest.
  const musicProjects = useAppSelector(state => state.spriteLab2.musicProjects);
  useEffect(() => {
    if (musicSeededRef.current) {
      return;
    }
    let cancelled = false;
    fetchMusicProjects()
      .then(projects => {
        if (cancelled) {
          return;
        }
        dispatch(setMusicProjects(projects));
        refreshToolbox();
        const newest = projects.find(p => !p.unavailable);
        const workspace = Blockly.getMainWorkspace();
        if (newest && workspace) {
          workspace
            .getBlocksByType(PLAY_MUSIC_BLOCK_TYPE, false)
            .forEach(block => {
              if (!block.getFieldValue('SONG')) {
                block.setFieldValue(newest.channel, 'SONG');
              }
            });
        }
      })
      .catch(e => console.warn('music projects unavailable', e));
    return () => {
      cancelled = true;
    };
  }, [levelProperties.id, dispatch, refreshToolbox]);

  const {nowPlaying, playMusic} = useSceneMusic(
    activeTab === 'Play',
    musicProjects
  );

  // The Code and Images tabs stay mounted behind a clip-path, which hides
  // them visually but leaves their contents (the whole Blockly workspace)
  // in the tab order and the accessibility tree. Inert while hidden.
  // Set via refs: React 18's JSX has no inert attribute.
  const codeWrapperRef = useRef<HTMLDivElement>(null);
  const imagesWrapperRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (codeWrapperRef.current) {
      codeWrapperRef.current.inert = activeTab !== 'Code';
    }
    if (imagesWrapperRef.current) {
      imagesWrapperRef.current.inert = activeTab !== 'Images';
    }
  }, [activeTab]);

  // The scene Play (re)starts from: null means the beginning (the first
  // scene). Clicking a preview sets it to the previewed scene; entering Play
  // from the tab button or "Restart game" clears it.
  const [playStartSceneId, setPlayStartSceneId] = useState<string | null>(null);

  // p5 listens for keys on window, so a game reading arrows/space would eat
  // them while the student edits blocks. Give the game the keyboard only in
  // Play: stopping the event at document runs after Blockly's own handlers
  // (on descendants) and before p5's window listener.
  useEffect(() => {
    if (activeTab === 'Play') {
      return;
    }
    const swallow = (e: KeyboardEvent) => {
      if (GAME_KEYS.has(e.key)) {
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', swallow);
    document.addEventListener('keyup', swallow);
    return () => {
      document.removeEventListener('keydown', swallow);
      document.removeEventListener('keyup', swallow);
    };
  }, [activeTab]);

  // A game key aimed at a focused control belongs to the control: activate
  // it, don't also jump. Stopping at document keeps the event from p5's
  // window listener; the control's default activation is unaffected.
  useEffect(() => {
    const swallowOnControls = (e: KeyboardEvent) => {
      if (!GAME_KEYS.has(e.key)) {
        return;
      }
      const target = e.target instanceof Element ? e.target : null;
      if (target?.closest(INTERACTIVE_CONTROLS)) {
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', swallowOnControls);
    document.addEventListener('keyup', swallowOnControls);
    return () => {
      document.removeEventListener('keydown', swallowOnControls);
      document.removeEventListener('keyup', swallowOnControls);
    };
  }, []);

  // Wire the scene-jump blocks; reassigned whenever the callbacks' inputs change.
  useEffect(() => {
    const engine = engineRef.current;
    if (!engineReady || !engine) {
      return;
    }
    engine.onGoToScene = (sceneId: string) => {
      // Previewing: don't navigate; resume the scene being edited.
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      if (scenes.some(s => s.id === sceneId)) {
        // Follow the jump in the editor too: leaving Play lands on the
        // scene that was just playing.
        setActiveSceneId(sceneId);
        runScene(sceneId);
        return;
      }
      const external = currentExternalProjectRef.current;
      if (external && external.scenes.some(s => s.id === sceneId)) {
        runExternalProjectScene(external, sceneId);
        return;
      }
      // Unknown scene id: resume the old scene rather than staying frozen.
      engine.cancelSceneJump();
    };
    engine.onGoToExternalScene = (key: string) => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      runExternalScene(key);
    };
    // By ref: the restart handler is declared below this effect, and it is
    // also what the Play tab's button calls.
    engine.onRestartScene = () => {
      if (!isPlayingRef.current) {
        engine.cancelSceneJump();
        return;
      }
      restartSceneRef.current?.();
    };
    // Cover on jump start, fade on landing — but not while previewing, where
    // the jump is cancelled (above) and the cover would just flash.
    engine.onSceneJumpStart = () => {
      if (isPlayingRef.current) {
        setJumpCover(true);
      }
    };
    engine.onSceneJumpLand = () => {
      setFadeTrigger(t => t + 1);
      setJumpCover(false);
    };
    engine.onSceneJumpCancel = () => setJumpCover(false);
    engine.onPlayMusic = playMusic;
  }, [
    engineReady,
    playMusic,
    scenes,
    runScene,
    runExternalScene,
    runExternalProjectScene,
  ]);

  // Start the live preview once the engine is ready.
  useEffect(() => {
    if (engineReady) {
      runProgram();
    }
  }, [engineReady, runProgram]);

  // Tab semantics: Play (re)starts at the chosen start scene
  // (or the beginning); returning to Code resumes previewing the scene being
  // edited. Skip the initial mount — the engine-ready effect handles the
  // first run.
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (!engineReady || prevTab === activeTab) {
      return;
    }
    if (activeTab === 'Play') {
      runScene(playStartSceneId ?? defaultPlaySceneId);
    } else if (activeTab === 'Code') {
      runScene(activeSceneId);
    }
    // playStartSceneId is set in the same batch as the tab change; the
    // prevTab guard keeps its later changes from re-running the scene.
  }, [
    activeTab,
    engineReady,
    runScene,
    activeSceneId,
    defaultPlaySceneId,
    playStartSceneId,
  ]);

  // Save workspace code to the active scene.
  const writeActiveSceneSource = useCallback(
    (source: WorkspaceSerialization) => {
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === activeSceneId ? {...s, source} : s
        ),
      }));
    },
    [updateSources, activeSceneId]
  );

  // Persist World-tab placements to the active scene and refresh the
  // preview, mirroring code edits. Applied cell-by-cell against the saved
  // sources so rapid paints can't overwrite each other.
  const handlePaintWorldCell = useCallback(
    (row: number, col: number, cell: WorldCell | null) => {
      updateSources(prev => ({
        ...prev,
        scenes: getScenes(prev).map(s =>
          s.id === activeSceneId
            ? {
                ...s,
                // Painting the resized world is what persists its size.
                world: paintWorldCell(worldFor(s), row, col, cell),
              }
            : s
        ),
      }));
      scheduleRun();
    },
    [updateSources, activeSceneId, scheduleRun, worldFor]
  );

  // Rename an image and cascade through every reference — blocks in all
  // scenes, World grids, and the live workspace — so tidying a name never
  // breaks the project.
  const handleRenameImage = useCallback(
    (oldName: string, newName: string): string | null => {
      if (!newName) {
        return 'Enter a name.';
      }
      const list = getStore().getState().animationList;
      if (!isNameUnique(newName, list.propsByKey)) {
        return 'That name is already used.';
      }
      const key = list.orderedKeys.find(
        (k: string) => list.propsByKey[k]?.name === oldName
      );
      if (!key) {
        return 'Image not found.';
      }
      dispatch(setAnimationName(key, newName) as unknown as AnyAction);
      updateSources(prev => renameImageReferences(prev, oldName, newName));
      renameImageReferencesOnWorkspace(
        Blockly.getMainWorkspace(),
        oldName,
        newName
      );
      refreshAnimationDropdownThumbnails();
      scheduleRun();
      return null;
    },
    [dispatch, updateSources, scheduleRun]
  );

  const handleDeleteImage = useCallback(
    (name: string) => {
      updateSources(prev => removeImageReferences(prev, name));
      removeImageReferencesOnWorkspace(Blockly.getMainWorkspace(), name);
      refreshAnimationDropdownThumbnails();
      scheduleRun();
    },
    [updateSources, scheduleRun]
  );

  // A user edit: the workspace already displays this content; persist it
  // and refresh the preview.
  const handleWorkspaceChange = useCallback(
    (source: WorkspaceSerialization) => {
      writeActiveSceneSource(source);
      // Keep the live preview in sync with the edited code.
      scheduleRun();
    },
    [writeActiveSceneSource, scheduleRun]
  );

  // Deliver user edits into the save/preview pipeline; intermediate field
  // edits (which don't serialize) just re-run the preview.
  useEffect(
    () => subscribeToChanges(handleWorkspaceChange, scheduleRun),
    [subscribeToChanges, handleWorkspaceChange, scheduleRun]
  );

  // Update the workspace and run the current scene when the active scene code changes.
  useEffect(() => {
    if (!animationsSeeded) {
      return;
    }
    const source = activeScene.source ?? DEFAULT_SCENE_SOURCE;
    if (isEqual(getCurrentBlocks(), source)) {
      return;
    }
    loadCode(source);
    runLocalScene(activeScene);
  }, [
    animationsSeeded,
    activeScene,
    getCurrentBlocks,
    loadCode,
    runLocalScene,
  ]);

  const handleSelectScene = useCallback(
    (sceneId: string) => {
      if (scenes.some(s => s.id === sceneId)) {
        setActiveSceneId(sceneId);
      }
    },
    [scenes]
  );

  const handleCreateScene = useCallback(
    (name: string) => {
      const scene: Scene = {
        id: createUuid(),
        name,
        source: DEFAULT_SCENE_SOURCE,
      };
      updateSources(prev => ({...prev, scenes: [...getScenes(prev), scene]}));
      // Both state updates land in one commit, so the reconcile effect
      // sees the new scene in the derived list.
      setActiveSceneId(scene.id);
    },
    [updateSources]
  );

  const handleCodeGenerated = useCallback(
    (source: WorkspaceSerialization) => {
      writeActiveSceneSource(source);
      dispatch(setActiveTab('Code'));
    },
    [writeActiveSceneSource, dispatch]
  );

  const handleTabChange = useCallback(
    (tab: Tab) => {
      // Entering Play from the tab button starts from the beginning.
      if (tab === 'Play') {
        setPlayStartSceneId(null);
      }
      dispatch(setActiveTab(tab));
    },
    [dispatch]
  );

  // Restart the whole game from the first scene.
  // Restarting must not leave focus parked on the clicked button, where
  // Space — also a game key — would re-activate it on every press. Keyboard
  // activations hand focus to the playspace; pointer activations blur to
  // the page instead — a silent focus on the playspace would still grow a
  // ring at the player's first keypress, because the browser promotes the
  // focused element to :focus-visible on keyboard use.
  const playspaceRef = useRef<HTMLDivElement>(null);
  const handOffRestartFocus = useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      if (isPointerClick(event)) {
        event.currentTarget.blur();
      } else {
        playspaceRef.current?.focus({preventScroll: true});
      }
    },
    []
  );

  const handleRestartGame = useCallback(() => {
    setPlayStartSceneId(null);
    runScene(defaultPlaySceneId);
  }, [runScene, defaultPlaySceneId]);

  // Re-run whatever scene is on stage right now (through any jumps).
  const handleRestartScene = useCallback(() => {
    const current = currentPlayingRef.current;
    if (!current) {
      runScene(defaultPlaySceneId);
    } else if (current.kind === 'local') {
      // Re-resolve by id: the scene's code may have been edited since.
      runScene(current.scene.id);
    } else {
      runExternalProjectScene(current.project, current.sceneId);
    }
  }, [runScene, defaultPlaySceneId, runExternalProjectScene]);
  restartSceneRef.current = handleRestartScene;

  // A restart from a block rides the scene-jump cover and fades when the new
  // run lands. A button press has no jump to land, so it asks for the same
  // fade itself — restarting should look the same however it was asked for.
  const handleRestartClick = useCallback(
    (event: React.MouseEvent<HTMLElement>, restart: () => void) => {
      handOffRestartFocus(event);
      setFadeTrigger(trigger => trigger + 1);
      restart();
    },
    [handOffRestartFocus]
  );

  // Clicking the live preview opens Play on the scene being previewed.
  // Previewing the first scene IS the beginning; keep the quiet default state.
  const handlePreviewClick = useCallback(() => {
    setPlayStartSceneId(
      activeSceneId === defaultPlaySceneId ? null : activeSceneId
    );
    dispatch(setActiveTab('Play'));
  }, [dispatch, activeSceneId, defaultPlaySceneId]);

  // World and Code are the scene-editing tabs: they share the corner
  // preview and the scene selector.
  const onSceneTab = activeTab === 'Code' || activeTab === 'World';
  const playspaceMode: PlayspaceMode =
    activeTab === 'Play' ? 'play' : onSceneTab ? 'preview' : 'hidden';

  // Sizes the location-picker's hover ghost like the sprite the program would
  // create (helper libraries can change the default per run).
  const getDefaultSpriteSize = useCallback(
    () => engineRef.current?.library?.defaultSpriteSize || 100,
    []
  );

  return (
    <div className={moduleStyles.labRow}>
      {showStartOver && isEditable && (
        <StartOverDialog
          onConfirm={() => {
            startOver();
            setShowStartOver(false);
          }}
          onCancel={() => setShowStartOver(false)}
          type="blocks"
        />
      )}
      <ResourcePanel
        levelProperties={levelProperties}
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        settings={[...blocklySettings, themeSetting]}
        className={classNames(
          !levelProperties.guideMode && moduleStyles.instructionsArea,
          !!levelProperties.guideMode && moduleStyles.resourceSidebar
        )}
        sidebarOnly={!!levelProperties.guideMode}
      />
      <div className={moduleStyles.divider} />
      <TabShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        enabledTabs={tabs}
        visibleTabs={tabs}
        onClickStartOver={isEditable ? () => setShowStartOver(true) : undefined}
        startOverExtra={
          activeTab === 'Play' && nowPlaying ? (
            <SceneMusicBar
              title={nowPlaying.title}
              loading={nowPlaying.loading}
            />
          ) : undefined
        }
        sceneTabsExtra={
          animationsSeeded ? (
            <SceneSelector
              scenes={sceneMetadata}
              activeSceneId={activeSceneId}
              disabled={!onSceneTab}
              locked={!!pinnedSceneId}
              onSelectScene={handleSelectScene}
              onCreateScene={handleCreateScene}
            />
          ) : undefined
        }
        playTabExtra={
          playspaceMode === 'play' ? (
            <>
              {/* On a pinned-scene level the game IS the one scene, so no
                  whole-game restart. */}
              {!pinnedSceneId && (
                <button
                  type="button"
                  className={moduleStyles.startOver}
                  onClick={event =>
                    handleRestartClick(event, handleRestartGame)
                  }
                >
                  Restart game
                </button>
              )}
              <button
                type="button"
                className={moduleStyles.startOver}
                onClick={event => handleRestartClick(event, handleRestartScene)}
              >
                Restart scene
              </button>
            </>
          ) : undefined
        }
      >
        {WorkspaceAlert}
        {/* Kept mounted (clipped) so the workspace survives tab switches;
          gated on animationsSeeded (see the seed effect). */}
        <div
          ref={codeWrapperRef}
          className={moduleStyles.codeTabWrapper}
          style={{
            clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
            pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
          }}
        >
          {animationsSeeded && (
            <div id={BLOCKLY_DIV_ID} className={moduleStyles.blocklyDiv} />
          )}
        </div>

        {/* Kept mounted (clipped) like the Code tab: mounting mid-switch eats
          the guide's transition frames, and remounting loses gallery state. */}
        {imagesMounted && (
          <div
            ref={imagesWrapperRef}
            className={classNames(moduleStyles.codeTabWrapper)}
            style={{
              clipPath: activeTab === 'Images' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'Images' ? 'auto' : 'none',
            }}
          >
            <div className={moduleStyles.imagesTab}>
              <GenerateImagePane
                uploadImage={uploadImage}
                onRenameImage={handleRenameImage}
                onDeleteImage={handleDeleteImage}
                lockedImageType={levelProperties.lockedImageType}
              />
            </div>
          </div>
        )}

        {worldTabEnabled && worldMounted && (
          <div
            className={moduleStyles.codeTabWrapper}
            style={{
              clipPath: activeTab === 'World' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'World' ? 'auto' : 'none',
            }}
          >
            <WorldTab
              world={activeWorld}
              sceneSize={activeSceneSize}
              onPaintCell={handlePaintWorldCell}
              selected={worldPaletteSelection}
              onSelect={setWorldPaletteSelection}
            />
          </div>
        )}

        {/* Always mounted so the engine keeps running; animates between the
          Code tab's corner preview and the Play tab's centered view. */}
        <Playspace
          boxRef={playspaceRef}
          mode={playspaceMode}
          fadeTrigger={fadeTrigger}
          covered={jumpCover}
          loading={externalLoading}
          getDefaultSpriteSize={getDefaultSpriteSize}
          onPreviewClick={handlePreviewClick}
        />

        {/* Floating guide, when the level asks for it. Plain instructions
          follow the student across every tab; the AI-codegen variant only
          makes sense over the Code workspace. (Image generation lives in
          the Images tab's image dialog.) */}
        {!!levelProperties.guideMode &&
          (levelProperties.guideMode === 'instructions' ||
            activeTab === 'Code') && (
            <GenerateSpriteLab
              guideMode={levelProperties.guideMode}
              instructions={guide.text}
              showContinue={guide.showContinue}
              levelProperties={levelProperties}
              onCodeGenerated={handleCodeGenerated}
            />
          )}
      </TabShell>
    </div>
  );
};

export default SpriteLab2View;
