import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import {cloneDeep, isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {applyBlockIdOverrides} from '@cdo/apps/blockly/utils';
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
  SET_INITIAL_ANIMATION_LIST,
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
} from '../ai/items/itemGeneration';
import {setExternalSceneRefreshHandler} from '../blockly/externalSceneDropdown';
import {refreshAnimationDropdownThumbnails} from '../blockly/imagePickerFields';
import {compileWorkspaceSource} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {onTrimsUpdated} from '../imageTrim';
import reseedablePageConstants, {
  RESET_PAGE_CONSTANTS,
} from '../redux/reseedablePageConstants';
import spriteLab2Reducer, {
  ExternalSceneOption,
  resetSpriteLab2,
  setActiveTab,
  setExternalScenes,
  setScenes,
  SpriteLab2Tab,
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
import {
  SpriteLab2LevelProperties,
  SpriteLab2Scene,
  SpriteLab2Source,
} from '../types';
import {
  compileWorldPrelude,
  paintWorldCell,
  SCENE_GRID_SIZE,
  SpriteLab2World,
  WORLD_GRID_SIZE,
  WorldCell,
} from '../world';

import {isPointerClick} from './blurAfterPointerClick';
import TabShell from './components/TabShell';
import GenerateImagePane from './GenerateImagePane';
import GenerateSpriteLab from './GenerateSpriteLab';
import Playspace, {PlayspaceMode} from './Playspace';
import SceneSelector from './SceneSelector';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';
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

const ENABLED_TABS: readonly SpriteLab2Tab[] = ['Images', 'Code', 'Play'];
const WORLD_TABS: readonly SpriteLab2Tab[] = [
  'Images',
  'World',
  'Code',
  'Play',
];

// World-tab experiment flags: ?world-tab=true shows the tab (levels can also
// opt in via the show_world_tab property); &world=large widens the editor
// from the scene grid to the whole world.
function getWorldTabParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    enabled: params.get('world-tab') === 'true',
    large: params.get('world') === 'large',
  };
}

const DEFAULT_SCENE_SOURCE = defaultSources.source;
const DEFAULT_SCENE_ID = 'scene-1';

function getScenes(sources: SpriteLab2Source): SpriteLab2Scene[] {
  if (sources.scenes?.length) {
    return sources.scenes;
  }
  // Create a default scene from the project's source for projects that don't have scenes already.
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

// Sprites come from the Items tab, so a new project starts with no animations.
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

interface SpriteLab2ViewProps {
  levelProperties: SpriteLab2LevelProperties;
  currentSources: SpriteLab2Source;
  updateSources: UseSourcesOutput<SpriteLab2Source>['updateSources'];
  patchSources: UseSourcesOutput<SpriteLab2Source>['patchSources'];
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
  const worldTabParams = useMemo(getWorldTabParams, []);
  const worldTab = {
    enabled: worldTabParams.enabled || !!levelProperties.showWorldTab,
    large: worldTabParams.large || !!levelProperties.showLargeWorld,
  };
  const tabs = worldTab.enabled ? WORLD_TABS : ENABLED_TABS;
  // The Images tab mounts once (idle pre-mount after seeding, or first
  // visit) and stays mounted clipped, so no visit pays the mount cost.
  const [imagesMounted, setImagesMounted] = useState(false);
  useEffect(() => {
    if (activeTab === 'Images') {
      setImagesMounted(true);
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

  const WorkspaceAlert = useLevelEditMode<SpriteLab2LevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          return {}; // TODO: Support toolbox mode with conversion to JSON.
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
      [currentSources]
    )
  );

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
  const [activeSceneId, setActiveSceneId] = useState<string | null>(
    () => scenes[0].id
  );
  const activeScene = scenes.find(s => s.id === activeSceneId) ?? scenes[0];

  // Reset activeSceneId if it doesn't point to an existing scene (e.g. code cleared via start over).
  useEffect(() => {
    if (!scenes.some(s => s.id === activeSceneId)) {
      setActiveSceneId(scenes[0].id);
    }
  }, [scenes, activeSceneId]);

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
    (animations: SpriteLab2Source['animations']) => {
      dispatch(
        setInitialAnimationList(
          // Deep-cloned: the legacy thunk normalizes its argument IN PLACE,
          // and this object belongs to the sources state.
          cloneDeep(animations || EMPTY_ANIMATION_LIST),
          // No v3 migration; the engine never runs the legacy share path.
          undefined as unknown as object,
          true /* isSpriteLab */
        )
      );
    },
    [dispatch]
  );

  // Seed the animation list BEFORE the workspace injects: dropdown fields
  // validate saved values against the store at block-load time — hence the
  // animationsSeeded gate on useBlocklyWorkspace, not just dispatch ordering.
  useEffect(() => {
    let cancelled = false;
    seedAnimationList(initialSources.animations);
    // Workspace injection only waits on the section-scenes fetch when saved
    // blocks reference external scenes; the gated path times out into
    // placeholder options so a hung API can't blank the lab.
    const savedExternalKeys = collectSavedExternalKeys(
      getScenes(initialSources)
    );
    if (savedExternalKeys.length === 0) {
      setAnimationsSeeded(true);
      fetchSectionScenes(levelProperties.id)
        .then(refs => {
          if (!cancelled) {
            dispatch(setExternalScenes(toExternalSceneOptions(refs)));
          }
        })
        .catch(e => console.warn('section scenes unavailable', e));
    } else {
      const seedExternalScenes = async () => {
        let options: ExternalSceneOption[] = [];
        try {
          const timeout = new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error('timeout')), 5000)
          );
          const refs = await Promise.race([
            fetchSectionScenes(levelProperties.id),
            timeout,
          ]);
          options = toExternalSceneOptions(refs);
        } catch (e) {
          console.warn('section scenes unavailable', e);
        }
        const known = new Set(options.map(o => o.key));
        savedExternalKeys.forEach(key => {
          if (!known.has(key)) {
            options.push({key, label: `(unavailable) #${key.slice(0, 10)}`});
          }
        });
        if (!cancelled) {
          dispatch(setExternalScenes(options));
          setAnimationsSeeded(true);
        }
      };
      seedExternalScenes();
    }
    return () => {
      cancelled = true;
    };
    // Re-seeds only when the level changes (seedAnimationList is stable,
    // initialSources is a ref-captured constant).
  }, [levelProperties.id, dispatch, initialSources, seedAnimationList]);

  // What's on stage right now — updated by every run, including scene jumps —
  // so "Restart scene" (and the reseed watcher below) can re-run it.
  const currentPlayingRef = useRef<
    | {kind: 'local'; scene: SpriteLab2Scene}
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
  const animationListState = useAppSelector(state => state.animationList);
  useEffect(() => {
    // Serialize from the LIVE store, not this commit's snapshot: this effect
    // runs after compileExternalScene's synchronous merge-and-restore, and a
    // snapshot save would leak the classmate's costumes into sources.
    patchSources({
      animations: getSerializedAnimationList(
        getStore().getState().animationList
      ),
    });
  }, [animationListState, patchSources]);

  const {getCode, getCurrentBlocks, loadCode, subscribeToChanges} =
    useBlocklyWorkspace({
      enabled: animationsSeeded,
      toolboxDefinition: levelProperties.toolboxDefinition,
      toolboxXml: levelProperties.toolboxBlocks,
      sharedBlocks: levelProperties.sharedBlocks,
      theme,
    });

  // The active scene's world, by ref: run callbacks read it at call time,
  // so world edits don't churn their identities.
  const activeWorldRef = useRef<SpriteLab2World | undefined>(undefined);
  useEffect(() => {
    activeWorldRef.current = activeScene?.world;
  }, [activeScene]);

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
    (scene: SpriteLab2Scene) => {
      const engine = engineRef.current;
      if (!engine) {
        return;
      }
      // Running a local scene leaves any external-project context behind.
      currentExternalProjectRef.current = null;
      engine.preloadAnimationsOverride = null;
      currentPlayingRef.current = {kind: 'local', scene};
      const prelude = compileWorldPrelude(scene.world);
      let code = '';
      try {
        const live = scene.id === activeSceneId ? getCode() : null;
        code =
          live ?? compileWorkspaceSource(scene.source ?? DEFAULT_SCENE_SOURCE);
      } catch (e) {
        // A scene that fails to compile shouldn't kill the jump entirely;
        // run it as an empty scene.
        console.error('Failed to compile scene', scene.id, e);
      }
      dispatch(setIsRunning(true));
      engine.runProgram(prelude + code);
    },
    [dispatch, activeSceneId, getCode]
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
    (scene: SpriteLab2Scene, project: ExternalProject) => {
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
        return compileWorkspaceSource(scene.source ?? DEFAULT_SCENE_SOURCE);
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
        project = await fetchExternalProject(parsed.channel);
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
    [runExternalProjectScene]
  );

  // The external dropdown re-fetches the section list on every open, so
  // scenes classmates add while this lab is open show up.
  useEffect(() => {
    setExternalSceneRefreshHandler(async () => {
      const refs = await fetchSectionScenes(levelProperties.id);
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
  }, [levelProperties.id, dispatch, scenes]);

  // Scene jumps should only navigate while playing. In preview (Code tab) a
  // goToScene block would otherwise pull the preview off the scene being edited.
  // The handlers below are wired once, so they read the live mode through a ref.
  const isPlayingRef = useRef(activeTab === 'Play');
  useEffect(() => {
    isPlayingRef.current = activeTab === 'Play';
  }, [activeTab]);

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
  }, [
    engineReady,
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
      runScene(playStartSceneId ?? scenes[0]?.id ?? null);
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
    scenes,
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
            ? {...s, world: paintWorldCell(s.world, row, col, cell)}
            : s
        ),
      }));
      scheduleRun();
    },
    [updateSources, activeSceneId, scheduleRun]
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
      const scene: SpriteLab2Scene = {
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
    (tab: SpriteLab2Tab) => {
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
    runScene(scenes[0]?.id ?? null);
  }, [runScene, scenes]);

  // Re-run whatever scene is on stage right now (through any jumps).
  const handleRestartScene = useCallback(() => {
    const current = currentPlayingRef.current;
    if (!current) {
      runScene(scenes[0]?.id ?? null);
    } else if (current.kind === 'local') {
      // Re-resolve by id: the scene's code may have been edited since.
      runScene(current.scene.id);
    } else {
      runExternalProjectScene(current.project, current.sceneId);
    }
  }, [runScene, scenes, runExternalProjectScene]);
  restartSceneRef.current = handleRestartScene;

  // Clicking the live preview opens Play on the scene being previewed.
  // Previewing the first scene IS the beginning; keep the quiet default state.
  const handlePreviewClick = useCallback(() => {
    setPlayStartSceneId(
      activeSceneId === (scenes[0]?.id ?? null) ? null : activeSceneId
    );
    dispatch(setActiveTab('Play'));
  }, [dispatch, activeSceneId, scenes]);

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
        codeTabExtra={
          animationsSeeded ? (
            <SceneSelector
              scenes={sceneMetadata}
              activeSceneId={activeSceneId}
              disabled={!onSceneTab}
              onSelectScene={handleSelectScene}
              onCreateScene={handleCreateScene}
            />
          ) : undefined
        }
        playTabExtra={
          playspaceMode === 'play' ? (
            <>
              <button
                type="button"
                className={moduleStyles.startOver}
                onClick={event => {
                  handOffRestartFocus(event);
                  handleRestartGame();
                }}
              >
                Restart game
              </button>
              <button
                type="button"
                className={moduleStyles.startOver}
                onClick={event => {
                  handOffRestartFocus(event);
                  handleRestartScene();
                }}
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
            <div className={moduleStyles.itemsTab}>
              <GenerateImagePane uploadImage={uploadImage} />
            </div>
          </div>
        )}

        {worldTab.enabled && activeTab === 'World' && (
          <div className={moduleStyles.codeTabWrapper}>
            <WorldTab
              world={activeScene?.world}
              displaySize={worldTab.large ? WORLD_GRID_SIZE : SCENE_GRID_SIZE}
              onPaintCell={handlePaintWorldCell}
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

        {/* The image form always shows on Images; codegen only when the
          level asks for it. */}
        {((activeTab === 'Code' && !!levelProperties.guideMode) ||
          activeTab === 'Images') && (
          <GenerateSpriteLab
            guideMode={
              activeTab === 'Images'
                ? 'aiImageGenerate'
                : levelProperties.guideMode!
            }
            instructions={levelProperties.longInstructions}
            onCodeGenerated={handleCodeGenerated}
            uploadImage={uploadImage}
          />
        )}
      </TabShell>
    </div>
  );
};

export default SpriteLab2View;
