import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import {cloneDeep} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useSources, {UseSourcesOutput} from '@cdo/apps/lab2/hooks/useSources';
import useThemeSetting from '@cdo/apps/lab2/hooks/useThemeSetting';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import setFooterVisibility from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/setFooterVisibility';
import Loading from '@cdo/apps/lab2/views/Loading';
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
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {setExternalSceneRefreshHandler} from '../blockly/externalSceneDropdown';
import {
  compileWorkspaceSource,
  refreshAnimationDropdownThumbnails,
} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {SCENES_UI_VARIANT} from '../experiments';
import {onTrimsUpdated} from '../imageTrim';
import spriteLab2Reducer, {
  ExternalSceneOption,
  resetSpriteLab2,
  setActiveSceneId,
  setActiveTab,
  setExternalScenes,
  setHasEdited,
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
import {createEmptyGrid} from '../world/gridConstants';

import CodeTab, {CodeTabHandle} from './CodeTab';
import TabShell from './components/TabShell';
import GenerateSpriteLab from './GenerateSpriteLab';
import ItemsTab from './ItemsTab';
import Playspace, {PlayspaceMode} from './Playspace';
import SceneSelector from './SceneSelector';
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
  pageConstants,
  spriteLab2: spriteLab2Reducer,
});

// The scenes UI variant replaces the World tab with per-scene code workspaces.
const ENABLED_TABS: readonly SpriteLab2Tab[] = SCENES_UI_VARIANT
  ? ['Images', 'Code', 'Play']
  : ['Images', 'World', 'Code', 'Play'];

// A new scene starts as a bare "when run" workspace.
const DEFAULT_SCENE_SOURCE = defaultSources.source;

const DEFAULT_WORLD_ID = 'world1';

// Debounce between a workspace edit and the live-preview re-run.
const RUN_DEBOUNCE_MS = 400;

// Sprites come from the Items tab, so a new project starts with no animations.
const EMPTY_ANIMATION_LIST = {orderedKeys: [], propsByKey: {}};

interface SpriteLab2ViewProps {
  levelProperties: SpriteLab2LevelProperties;
  currentSources: SpriteLab2Source;
  patchSources: UseSourcesOutput<SpriteLab2Source>['patchSources'];
  channelId?: string;
}

const SpriteLab2View: React.FunctionComponent<SpriteLab2ViewProps> = ({
  levelProperties,
  currentSources,
  patchSources,
  channelId,
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
  const hasEdited = useAppSelector(state => state.spriteLab2.hasEdited);
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
  }, [dispatch, channelId, currentLevelId, scriptId]);

  // This lab owns the full viewport; hide the server-rendered footer.
  useEffect(() => {
    setFooterVisibility(false);
    return () => setFooterVisibility(true);
  }, []);

  // Blocks rendered before an image finished trimming show the untrimmed
  // thumbnail; refresh the costume dropdowns as trims land.
  useEffect(() => onTrimsUpdated(refreshAnimationDropdownThumbnails), []);

  // Sources as of level load: seeding and engine creation are once-per-level
  // (the container remounts this view per level, after sources load).
  const initialSources = useRef(currentSources).current;

  const engineRef = useRef<SpriteLab2Engine | null>(null);
  const codeTabRef = useRef<CodeTabHandle>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [animationsSeeded, setAnimationsSeeded] = useState(false);
  // Jump transition: the cover blanks the playspace while the target loads;
  // fadeTrigger increments on landing to play the fade-from-black.
  const [jumpCover, setJumpCover] = useState(false);
  const [fadeTrigger, setFadeTrigger] = useState(0);

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

  // Full scenes live here and in project sources; redux mirrors {id, name}
  // for the selector and block dropdowns. scenes[0] is the default scene.
  const scenesRef = useRef<SpriteLab2Scene[]>([]);
  const activeSceneIdRef = useRef<string | null>(null);
  const sceneMetadata = useAppSelector(state => state.spriteLab2.scenes);
  const activeSceneId = useAppSelector(state => state.spriteLab2.activeSceneId);

  // Lab2 switches levels in place; reset the lab slice and any in-flight
  // location pick on leave. Declared before the seed effect so on a level
  // switch the reset lands first.
  useEffect(() => {
    return () => {
      dispatch(resetSpriteLab2());
      dispatch(cancelLocationSelection() as AnyAction);
    };
  }, [levelProperties.id, dispatch]);

  // Seed the animation and scene lists BEFORE the Code tab mounts: dropdown
  // fields validate saved values against the store at block-load time, and a
  // child's mount effect runs before any parent effect — hence the
  // animationsSeeded render gate, not just dispatch ordering.
  useEffect(() => {
    let cancelled = false;
    dispatch(
      setInitialAnimationList(
        // Deep-cloned: project sources are Immer-frozen (they live in the
        // lab2 redux slice) and the legacy thunk normalizes its argument IN
        // PLACE — mutating a frozen object throws in strict-mode production
        // bundles and the animation list never seeds.
        cloneDeep(initialSources.animations || EMPTY_ANIMATION_LIST),
        // No v3 migration; the engine never runs the legacy share path.
        undefined as unknown as object,
        true /* isSpriteLab */
      )
    );
    if (!SCENES_UI_VARIANT) {
      setAnimationsSeeded(true);
      return;
    }
    // Migrate single-workspace projects to one scene on first open.
    const scenes: SpriteLab2Scene[] = initialSources.scenes?.length
      ? initialSources.scenes
      : [
          {
            id: createUuid(),
            name: 'Scene 1',
            source:
              (initialSources.source as WorkspaceSerialization) ??
              DEFAULT_SCENE_SOURCE,
          },
        ];
    scenesRef.current = scenes;
    activeSceneIdRef.current = scenes[0].id;
    dispatch(setScenes(scenes.map(s => ({id: s.id, name: s.name}))));
    dispatch(setActiveSceneId(scenes[0].id));

    // Block mount only waits on the section-scenes fetch when saved blocks
    // reference external scenes; the gated path times out into placeholder
    // options so a hung API can't blank the lab.
    const savedExternalKeys = collectSavedExternalKeys(scenes);
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
    // Re-seeds only when the level changes (dispatch is store-stable,
    // initialSources is a ref-captured constant).
  }, [levelProperties.id, dispatch, initialSources]);

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
    // levelProperties' identity changes only on level load, so this
    // re-creates the engine once per level (same keying as dance).
  }, [levelProperties, initialSources]);

  // Persist Images-tab changes back to sources in the serialized shape.
  const animationListState = useAppSelector(state => state.animationList);
  const skipFirstAnimationSave = useRef(true);
  useEffect(() => {
    if (skipFirstAnimationSave.current) {
      // Don't immediately re-save the list we just seeded.
      skipFirstAnimationSave.current = false;
      return;
    }
    // Serialize from the LIVE store, not this commit's snapshot: this effect
    // runs after compileExternalScene's synchronous merge-and-restore, and a
    // snapshot save would leak the classmate's costumes into sources.
    patchSources({
      animations: getSerializedAnimationList(
        getStore().getState().animationList
      ),
    });
  }, [animationListState, patchSources]);

  // Run the current program as the live preview (cheap: the engine reuses p5).
  const runProgram = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    dispatch(setIsRunning(true));
    engine.runProgram(codeTabRef.current?.getCode() || '');
  }, [dispatch]);

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
  const runScene = useCallback(
    (sceneId: string | null) => {
      const engine = engineRef.current;
      const scene = scenesRef.current.find(s => s.id === sceneId);
      if (!engine || !scene) {
        // If a jump triggered this, resume the old scene instead of leaving
        // it frozen.
        engineRef.current?.cancelSceneJump();
        return;
      }
      // Running a local scene leaves any external-project context behind.
      currentExternalProjectRef.current = null;
      engine.preloadAnimationsOverride = null;
      let code = '';
      try {
        code =
          scene.id === activeSceneIdRef.current && codeTabRef.current
            ? codeTabRef.current.getCode()
            : compileWorkspaceSource(scene.source ?? DEFAULT_SCENE_SOURCE);
      } catch (e) {
        // A scene that fails to compile shouldn't kill the jump entirely;
        // run it as an empty scene.
        console.error('Failed to compile scene', scene.id, e);
      }
      dispatch(setIsRunning(true));
      engine.runProgram(code);
    },
    [dispatch]
  );
  const runSceneRef = useRef(runScene);
  runSceneRef.current = runScene;

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
      const currentSceneMetadata = scenesRef.current.map(s => ({
        id: s.id,
        name: s.name,
      }));
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
    [dispatch]
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
  const runExternalSceneRef = useRef(runExternalScene);
  runExternalSceneRef.current = runExternalScene;
  const runExternalProjectSceneRef = useRef(runExternalProjectScene);
  runExternalProjectSceneRef.current = runExternalProjectScene;

  // The external dropdown re-fetches the section list on every open, so
  // scenes classmates add while this lab is open show up.
  useEffect(() => {
    if (!SCENES_UI_VARIANT) {
      return;
    }
    setExternalSceneRefreshHandler(async () => {
      const refs = await fetchSectionScenes(levelProperties.id);
      const options = toExternalSceneOptions(refs);
      const known = new Set(options.map(o => o.key));
      collectSavedExternalKeys(scenesRef.current).forEach(key => {
        if (!known.has(key)) {
          options.push({key, label: `(unavailable) #${key.slice(0, 10)}`});
        }
      });
      dispatch(setExternalScenes(options));
    });
    return () => setExternalSceneRefreshHandler(null);
  }, [levelProperties.id, dispatch]);

  // Start the live preview once the engine is ready and wire the scene-jump
  // blocks. Inside a running external scene, go-to-scene resolves against
  // that project's scenes, so classmates' multi-scene games work.
  useEffect(() => {
    if (engineReady) {
      const engine = engineRef.current;
      if (engine) {
        engine.onGoToScene = (sceneId: string) => {
          if (scenesRef.current.some(s => s.id === sceneId)) {
            runSceneRef.current(sceneId);
            return;
          }
          const external = currentExternalProjectRef.current;
          if (external && external.scenes.some(s => s.id === sceneId)) {
            runExternalProjectSceneRef.current(external, sceneId);
            return;
          }
          // Unknown scene id: resume the old scene rather than staying frozen.
          engine.cancelSceneJump();
        };
        engine.onGoToExternalScene = (key: string) =>
          runExternalSceneRef.current(key);
        // Cover on jump start, fade on landing; the cover and the fade's
        // opaque first frame swap in one commit, so there's no flash.
        engine.onSceneJumpStart = () => setJumpCover(true);
        engine.onSceneJumpLand = () => {
          setFadeTrigger(t => t + 1);
          setJumpCover(false);
        };
        engine.onSceneJumpCancel = () => setJumpCover(false);
      }
      runProgram();
    }
  }, [engineReady, runProgram]);

  // Scenes variant tab semantics: Play always (re)starts at the default scene;
  // returning to Code resumes previewing the scene being edited. Skip the
  // initial mount — the engine-ready effect handles the first run.
  const prevTabRef = useRef(activeTab);
  useEffect(() => {
    const prevTab = prevTabRef.current;
    prevTabRef.current = activeTab;
    if (!SCENES_UI_VARIANT || !engineReady || prevTab === activeTab) {
      return;
    }
    if (activeTab === 'Play') {
      runScene(scenesRef.current[0]?.id ?? null);
    } else if (activeTab === 'Code') {
      runScene(activeSceneIdRef.current);
    }
  }, [activeTab, engineReady, runScene]);

  const handleSourceChange = useCallback(
    (source: WorkspaceSerialization) => {
      if (SCENES_UI_VARIANT) {
        // The workspace edits the active scene. Scenes are the single source
        // of truth: only `scenes` is written; the variant-off read path
        // falls back to scenes[0].
        scenesRef.current = scenesRef.current.map(s =>
          s.id === activeSceneIdRef.current ? {...s, source} : s
        );
        patchSources({scenes: scenesRef.current});
      } else {
        patchSources({source});
      }
      // Keep the live preview in sync with the edited code.
      scheduleRun();
    },
    [patchSources, scheduleRun]
  );

  const handleEdit = useCallback(() => {
    dispatch(setHasEdited(true));
  }, [dispatch]);

  // Scenes variant: switch which scene's workspace is open in the Code tab.
  // Flip the active-scene bookkeeping first — loading blocks fires change
  // events, and handleSourceChange must attribute them to the new scene.
  const handleSelectScene = useCallback(
    (sceneId: string) => {
      const scene = scenesRef.current.find(s => s.id === sceneId);
      if (!scene || sceneId === activeSceneIdRef.current) {
        return;
      }
      activeSceneIdRef.current = sceneId;
      dispatch(setActiveSceneId(sceneId));
      codeTabRef.current?.loadScene(scene.source ?? DEFAULT_SCENE_SOURCE);
      // The preview follows the scene being edited.
      runScene(sceneId);
    },
    [dispatch, runScene]
  );

  const handleCreateScene = useCallback(
    (name: string) => {
      const scene: SpriteLab2Scene = {
        id: createUuid(),
        name,
        source: DEFAULT_SCENE_SOURCE,
      };
      scenesRef.current = [...scenesRef.current, scene];
      patchSources({scenes: scenesRef.current});
      dispatch(
        setScenes(scenesRef.current.map(s => ({id: s.id, name: s.name})))
      );
      handleSelectScene(scene.id);
    },
    [dispatch, patchSources, handleSelectScene]
  );

  // World grid (rudimentary, single world for now). Persisted to sources but
  // not yet wired into the runtime.
  const worldGrid =
    currentSources.worlds?.find(w => w.id === currentSources.activeWorldId)
      ?.grid ||
    currentSources.worlds?.[0]?.grid ||
    createEmptyGrid();
  const handleWorldGridChange = useCallback(
    (grid: string[][]) => {
      patchSources({
        worlds: [{id: DEFAULT_WORLD_ID, grid}],
        activeWorldId: DEFAULT_WORLD_ID,
      });
    },
    [patchSources]
  );

  // AI-generated blocks load into the Code tab; switch there so the user sees
  // them.
  const handleCodeGenerated = useCallback(
    (source: WorkspaceSerialization) => {
      codeTabRef.current?.loadCode(source);
      dispatch(setActiveTab('Code'));
    },
    [dispatch]
  );

  // The playspace persists across tabs (the engine keeps running), so switching
  // tabs only repositions/resizes it.
  const handleTabChange = useCallback(
    (tab: SpriteLab2Tab) => {
      dispatch(setActiveTab(tab));
    },
    [dispatch]
  );

  const playspaceMode: PlayspaceMode =
    activeTab === 'Play' ? 'play' : activeTab === 'Code' ? 'preview' : 'hidden';

  // Sizes the location-picker's hover ghost like the sprite the program would
  // create (helper libraries can change the default per run).
  const getDefaultSpriteSize = useCallback(
    () => engineRef.current?.library?.defaultSpriteSize || 100,
    []
  );

  // The workspace opens on the default scene's blocks (the seed effect makes
  // scenes[0] active before the Code tab mounts). Scenes are the source of
  // truth in either mode; the top-level `source` is only a fallback for
  // projects saved before scenes existed.
  const initialWorkspaceSource = (currentSources.scenes?.[0]?.source ??
    currentSources.source) as WorkspaceSerialization | undefined;

  return (
    <div className={moduleStyles.labRow}>
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
        codeTabExtra={
          SCENES_UI_VARIANT && animationsSeeded ? (
            <SceneSelector
              scenes={sceneMetadata}
              activeSceneId={activeSceneId}
              disabled={activeTab !== 'Code'}
              onSelectScene={handleSelectScene}
              onCreateScene={handleCreateScene}
            />
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
            <CodeTab
              ref={codeTabRef}
              initialSource={initialWorkspaceSource}
              toolboxDefinition={levelProperties.toolboxDefinition}
              toolboxXml={levelProperties.toolboxBlocks}
              sharedBlocks={levelProperties.sharedBlocks}
              theme={theme === 'Dark' ? 'Dark' : 'Light'}
              onSourceChange={handleSourceChange}
              onEdit={handleEdit}
              onIntermediateChange={scheduleRun}
            />
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

        {!SCENES_UI_VARIANT && activeTab === 'World' && (
          <div className={classNames(moduleStyles.codeTabWrapper)}>
            <WorldTab grid={worldGrid} onGridChange={handleWorldGridChange} />
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

// Container that handles loading sources and wiring project manager, and the hands off to the inner view.
const SpriteLab2Container: React.FunctionComponent<
  LabProps<SpriteLab2LevelProperties, SpriteLab2Source>
> = ({levelProperties}) => {
  const dispatch = useAppDispatch();
  const {currentSources, patchSources, channel, projectManager, loadError} =
    useSources<SpriteLab2Source>({
      levelProperties,
      defaultSources,
      includeVersionHistory: true,
    });

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
  return (
    <SpriteLab2View
      levelProperties={levelProperties}
      currentSources={currentSources}
      patchSources={patchSources}
      channelId={channel?.id}
    />
  );
};

export default SpriteLab2Container;
