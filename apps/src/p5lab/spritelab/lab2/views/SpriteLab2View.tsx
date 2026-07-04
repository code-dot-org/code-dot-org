import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {LabProps} from '@cdo/apps/lab2/types';
import setFooterVisibility from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel/Footer/setFooterVisibility';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
// p5lab/reducers is a CommonJS bundle of all the classic Sprite Lab slices;
// pull the ones the engine and image list need by key.
import * as p5labReducersModule from '@cdo/apps/p5lab/reducers';
import {setInitialAnimationList} from '@cdo/apps/p5lab/redux/animationList';
import {getSerializedAnimationList} from '@cdo/apps/p5lab/shapes';
import {getStore, registerReducers} from '@cdo/apps/redux';
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {
  compileWorkspaceSource,
  setExternalSceneRefreshHandler,
} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {SCENES_UI_VARIANT} from '../experiments';
import spriteLab2Reducer, {
  ExternalSceneOption,
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

// Register the legacy Sprite Lab slices the reused p5.play engine and the image
// list need. Lab2 shares the global getStore() store, so this gives them the
// exact store shape they read from. (The classic AnimationTab/Piskel editor and
// its slices are not used — images come from the AI generator.)
registerReducers({
  animationList: p5labReducers.animationList,
  textConsole: p5labReducers.textConsole,
  spritelabInputList: p5labReducers.spritelabInputList,
  // The location-picker block (pin -> click in the playspace to set coords)
  // reads/writes this slice.
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

// Sprites come from the Items tab, so a new project starts with no animations.
const EMPTY_ANIMATION_LIST = {orderedKeys: [], propsByKey: {}};

const SpriteLab2View: React.FunctionComponent<{
  levelProperties: SpriteLab2LevelProperties;
}> = ({levelProperties}) => {
  const {theme} = useTheme();
  const dispatch = useAppDispatch();
  const {currentSources, updateSources} = useSources<SpriteLab2Source>();

  const activeTab = useAppSelector(state => state.spriteLab2.activeTab);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  // Sprite Lab is a Blockly lab, and the animationList logic + engine read
  // these page constants; seed them since we bypass the legacy StudioApp.init.
  // Also populate the process-wide AichatContextManager that the aiGateway
  // image-generation calls read from.
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

  // This lab owns the full viewport; hide the server-rendered small footer
  // (language selector + copyright) while it's mounted.
  useEffect(() => {
    setFooterVisibility(false);
    return () => setFooterVisibility(true);
  }, []);

  const sourcesRef = useRef(currentSources);
  useEffect(() => {
    sourcesRef.current = currentSources;
  }, [currentSources]);

  const mergeSources = useCallback(
    (patch: Partial<SpriteLab2Source>, forceSave = false) => {
      const next = {...sourcesRef.current, ...patch};
      updateSources(next, forceSave);
    },
    [updateSources]
  );

  const engineRef = useRef<SpriteLab2Engine | null>(null);
  const codeTabRef = useRef<CodeTabHandle>(null);
  const [engineReady, setEngineReady] = useState(false);
  const [animationsSeeded, setAnimationsSeeded] = useState(false);
  // Scene-jump fade: incremented per jump; Playspace replays the fade.
  const [fadeTrigger, setFadeTrigger] = useState(0);

  // Scenes UI variant. Full scenes (with workspace sources) live here and in
  // project sources; redux mirrors just {id, name} for the selector and the
  // go-to-scene block's dropdown. scenes[0] is the default scene.
  const scenesRef = useRef<SpriteLab2Scene[]>([]);
  const activeSceneIdRef = useRef<string | null>(null);
  const sceneMetadata = useAppSelector(state => state.spriteLab2.scenes);
  const activeSceneId = useAppSelector(state => state.spriteLab2.activeSceneId);

  // Seed the animation list and (scenes variant) the scene lists — local and
  // section-mates' — from saved sources and the section-scenes API BEFORE the
  // Code tab mounts (the Code tab is gated on animationsSeeded below). The
  // costume/background dropdown fields — and both scene dropdowns — validate
  // their saved values against the store at block-load time; loading blocks
  // against empty lists nulls every saved selection. This must be a render
  // gate, not just dispatch ordering: a child's mount effect (where the
  // workspace loads blocks) runs before any parent effect.
  useEffect(() => {
    let cancelled = false;
    dispatch(
      setInitialAnimationList(
        sourcesRef.current.animations || EMPTY_ANIMATION_LIST,
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
    const scenes: SpriteLab2Scene[] = sourcesRef.current.scenes?.length
      ? sourcesRef.current.scenes
      : [
          {
            id: createUuid(),
            name: 'Scene 1',
            source: sourcesRef.current.source ?? DEFAULT_SCENE_SOURCE,
          },
        ];
    scenesRef.current = scenes;
    activeSceneIdRef.current = scenes[0].id;
    dispatch(setScenes(scenes.map(s => ({id: s.id, name: s.name}))));
    dispatch(setActiveSceneId(scenes[0].id));

    // Section-mates' scenes for the go-to-external-scene dropdown. The Code
    // tab only waits for this when saved blocks actually reference external
    // scenes (their dropdown values validate against the options at block-load
    // time); otherwise blocks mount immediately and the list arrives in the
    // background. A slow/hung API must never blank the lab, so the gated path
    // also times out into placeholder options.
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
    // Re-seed only when the level changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelProperties.id]);

  // Instantiate the p5.play engine once. Unlike classic Sprite Lab we don't
  // auto-load the legacy default sprite library; SpriteLab2 sprites come from
  // the Images tab (AI generation), so a new project starts with an empty
  // list. p5 preload then completes immediately instead of blocking on remote
  // default-sprite assets.
  useEffect(() => {
    let cancelled = false;
    const savedAnimations =
      sourcesRef.current.animations || EMPTY_ANIMATION_LIST;

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
    // Re-create the engine only when the level changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [levelProperties.id]);

  // Persist animation-editor changes (costumes/backgrounds added or edited in
  // the Items tab) back to project sources in the classic serialized shape.
  const animationListState = useAppSelector(state => state.animationList);
  const skipFirstAnimationSave = useRef(true);
  useEffect(() => {
    if (skipFirstAnimationSave.current) {
      // Don't immediately re-save the list we just seeded.
      skipFirstAnimationSave.current = false;
      return;
    }
    mergeSources({animations: getSerializedAnimationList(animationListState)});
  }, [animationListState, mergeSources]);

  // Run the current program as the live preview. The engine reuses its p5
  // instance across re-runs, so this is cheap and safe to call on every edit.
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
    runTimer.current = window.setTimeout(runProgram, 400);
  }, [runProgram]);

  // Scenes UI variant: run one scene's program. The scene open in the Code tab
  // compiles from the live workspace; other scenes compile headless from their
  // saved sources. withFade plays the fade-from-black (used for runtime jumps
  // via the go-to-scene block, not for editor/tab switches).
  const runScene = useCallback(
    (sceneId: string | null, withFade = false) => {
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
      if (withFade) {
        setFadeTrigger(t => t + 1);
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

  // Compile an external scene. Its costume/background dropdowns validate
  // against the redux animation list at block-load time — and its go-to-scene
  // dropdowns against the redux scene list — so merge the external project's
  // animations and scenes in for the (synchronous) compile and restore after.
  // React batches the dispatches, so effects only ever see the restored state.
  const compileExternalScene = useCallback(
    (scene: SpriteLab2Scene, project: ExternalProject) => {
      const currentAnimations = getSerializedAnimationList(
        getStore().getState().animationList
      );
      const theirs = project.animations;
      const merged = {
        orderedKeys: [
          ...currentAnimations.orderedKeys,
          ...(theirs.orderedKeys || []).filter(
            k => !currentAnimations.propsByKey[k]
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
      dispatch(
        setInitialAnimationList(
          merged,
          undefined as unknown as object,
          true /* isSpriteLab */
        )
      );
      dispatch(
        setScenes([
          ...currentSceneMetadata,
          ...project.scenes.map(s => ({id: s.id, name: s.name})),
        ])
      );
      try {
        return compileWorkspaceSource(scene.source ?? DEFAULT_SCENE_SOURCE);
      } finally {
        dispatch(
          setInitialAnimationList(
            currentAnimations,
            undefined as unknown as object,
            true /* isSpriteLab */
          )
        );
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
      setFadeTrigger(t => t + 1);
      dispatch(setIsRunning(true));
      engine.runProgram(code);
    },
    [dispatch, compileExternalScene]
  );

  // Handle the go-to-external-scene block: fetch the classmate's project
  // fresh — their scenes may have changed while this lab has been open — and
  // run the target scene. The last good copy is kept only as a fallback when
  // the fetch fails. The playspace shows a delayed-fade-in spinner while the
  // fetch is slow.
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

  // The go-to-external-scene dropdown re-fetches the section list every time
  // it opens, so scenes classmates add while this lab is open show up.
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

  // Start the live preview once the engine is ready, and wire the scene-jump
  // blocks. A plain go-to-scene inside a running external scene resolves
  // against that project's scenes, so classmates' multi-scene games work.
  useEffect(() => {
    if (engineReady) {
      const engine = engineRef.current;
      if (engine) {
        engine.onGoToScene = (sceneId: string) => {
          if (scenesRef.current.some(s => s.id === sceneId)) {
            runSceneRef.current(sceneId, true /* withFade */);
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
    (
      source: WorkspaceSerialization,
      toolbox?: SpriteLab2Source['toolboxDefinition']
    ) => {
      if (SCENES_UI_VARIANT) {
        // The workspace edits the active scene. Mirror scenes[0] into the
        // legacy `source` field so the project still opens with the variant
        // off.
        scenesRef.current = scenesRef.current.map(s =>
          s.id === activeSceneIdRef.current ? {...s, source} : s
        );
        mergeSources({
          scenes: scenesRef.current,
          source: scenesRef.current[0]?.source,
          toolboxDefinition: toolbox,
        });
      } else {
        mergeSources({source, toolboxDefinition: toolbox});
      }
      // Keep the live preview in sync with the edited code.
      scheduleRun();
    },
    [mergeSources, scheduleRun]
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
      codeTabRef.current?.loadScene(
        (scene.source ?? DEFAULT_SCENE_SOURCE) as WorkspaceSerialization
      );
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
      mergeSources({scenes: scenesRef.current});
      dispatch(
        setScenes(scenesRef.current.map(s => ({id: s.id, name: s.name})))
      );
      handleSelectScene(scene.id);
    },
    [dispatch, mergeSources, handleSelectScene]
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
      mergeSources({
        worlds: [{id: DEFAULT_WORLD_ID, grid}],
        activeWorldId: DEFAULT_WORLD_ID,
      });
    },
    [mergeSources]
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

  // Scenes variant: the workspace opens on the default scene's blocks (the
  // seed effect makes scenes[0] active before the Code tab mounts).
  const initialWorkspaceSource = SCENES_UI_VARIANT
    ? ((currentSources.scenes?.[0]?.source ?? currentSources.source) as
        | WorkspaceSerialization
        | undefined)
    : (currentSources.source as WorkspaceSerialization | undefined);

  return (
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
      {/* Keep the Code tab mounted so the Blockly workspace survives switches.
          Mount it only after the animation list is seeded: its dropdown fields
          resolve saved costume/background names against the list at
          block-load time. */}
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
            toolboxXml={levelProperties.toolbox}
            sharedBlocks={levelProperties.sharedBlocks}
            theme={theme === 'Dark' ? 'Dark' : 'Light'}
            onSourceChange={handleSourceChange}
            onEdit={handleEdit}
          />
        )}
      </div>

      {activeTab === 'Images' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <ItemsTab />
        </div>
      )}

      {!SCENES_UI_VARIANT && activeTab === 'World' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <WorldTab grid={worldGrid} onGridChange={handleWorldGridChange} />
        </div>
      )}

      {/* The single, persistent playspace: a live preview pinned to the
          top-right on the Code tab, animating to a large centered view on the
          Play tab. Always mounted so the engine keeps running. */}
      <Playspace
        mode={playspaceMode}
        fadeTrigger={fadeTrigger}
        loading={externalLoading}
      />

      {/* Lab2 Guide overlay (Music-style), driven by the level's guideMode.
          Only shown on the Code tab. */}
      {levelProperties.guideMode && activeTab === 'Code' && (
        <GenerateSpriteLab
          guideMode={levelProperties.guideMode}
          instructions={levelProperties.longInstructions}
          onCodeGenerated={handleCodeGenerated}
        />
      )}
    </TabShell>
  );
};

export default (
  props: LabProps<SpriteLab2LevelProperties, SpriteLab2Source>
) => {
  return (
    <SourcesContainer
      {...props}
      defaultSources={defaultSources}
      key={props.levelProperties.id}
    >
      <SpriteLab2View levelProperties={props.levelProperties} />
    </SourcesContainer>
  );
};
