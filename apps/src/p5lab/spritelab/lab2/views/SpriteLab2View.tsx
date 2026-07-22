import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import {cloneDeep, isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
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

import TabShell from './components/TabShell';
import GenerateSpriteLab from './GenerateSpriteLab';
import ItemsTab from './ItemsTab';
import Playspace, {PlayspaceMode} from './Playspace';
import SceneSelector from './SceneSelector';
import useBlocklyWorkspace, {BLOCKLY_DIV_ID} from './useBlocklyWorkspace';

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

  // Reseed the animation list when sources are reinitialized (e.g. start over).
  const seededReinitCountRef = useRef(0);
  useEffect(() => {
    if (sourcesReinitializedCount === seededReinitCountRef.current) {
      return;
    }
    seededReinitCountRef.current = sourcesReinitializedCount;
    seedAnimationList(currentSources.animations);
  }, [sourcesReinitializedCount, currentSources.animations, seedAnimationList]);

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

  // Run the current program as the live preview (cheap: the engine reuses p5).
  const runProgram = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    dispatch(setIsRunning(true));
    engine.runProgram(getCode() ?? '');
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
  // What's on stage right now — updated by every run, including scene jumps —
  // so "Restart scene" can re-run it.
  const currentPlayingRef = useRef<
    | {kind: 'local'; scene: SpriteLab2Scene}
    | {kind: 'external'; project: ExternalProject; sceneId: string}
    | null
  >(null);

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
      engine.runProgram(code);
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
      engine.runProgram(code);
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

  // The scene Play (re)starts from: null means the beginning (the first
  // scene). Clicking a preview sets it to the previewed scene; entering Play
  // from the tab button or "Restart game" clears it.
  const [playStartSceneId, setPlayStartSceneId] = useState<string | null>(null);

  // The live preview and Blockly share the window keyboard: p5 listens on
  // window, so a game that reads arrows/space would eat those keys while the
  // student is editing on the Code tab. Give the game the keyboard only in
  // Play. Stop the event at document — after Blockly's own handlers (on
  // descendants) have run, before p5's window listener — so block editing,
  // text fields, and workspace nav keep working; only the game is cut off.
  useEffect(() => {
    if (activeTab === 'Play') {
      return;
    }
    const GAME_KEYS = new Set([
      'ArrowLeft',
      'ArrowRight',
      'ArrowUp',
      'ArrowDown',
      ' ',
      'Spacebar',
    ]);
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

  // Clicking the live preview opens Play on the scene being previewed.
  // Previewing the first scene IS the beginning; keep the quiet default state.
  const handlePreviewClick = useCallback(() => {
    setPlayStartSceneId(
      activeSceneId === (scenes[0]?.id ?? null) ? null : activeSceneId
    );
    dispatch(setActiveTab('Play'));
  }, [dispatch, activeSceneId, scenes]);

  const playspaceMode: PlayspaceMode =
    activeTab === 'Play' ? 'play' : activeTab === 'Code' ? 'preview' : 'hidden';

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
        enabledTabs={ENABLED_TABS}
        visibleTabs={ENABLED_TABS}
        onClickStartOver={isEditable ? () => setShowStartOver(true) : undefined}
        codeTabExtra={
          animationsSeeded ? (
            <SceneSelector
              scenes={sceneMetadata}
              activeSceneId={activeSceneId}
              disabled={activeTab !== 'Code'}
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
                onClick={handleRestartGame}
              >
                Restart game
              </button>
              <button
                type="button"
                className={moduleStyles.startOver}
                onClick={handleRestartScene}
              >
                Restart scene
              </button>
            </>
          ) : undefined
        }
      >
        {/* Kept mounted (clipped) so the workspace survives tab switches;
          gated on animationsSeeded (see the seed effect). */}
        <div
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
            className={classNames(moduleStyles.codeTabWrapper)}
            style={{
              clipPath: activeTab === 'Images' ? 'none' : 'inset(100%)',
              pointerEvents: activeTab === 'Images' ? 'auto' : 'none',
            }}
          >
            <ItemsTab />
          </div>
        )}

        {/* Always mounted so the engine keeps running; animates between the
          Code tab's corner preview and the Play tab's centered view. */}
        <Playspace
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
            channelId={channelId}
          />
        )}
      </TabShell>
    </div>
  );
};

export default SpriteLab2View;
