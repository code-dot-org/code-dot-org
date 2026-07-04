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
import {registerReducers} from '@cdo/apps/redux';
import pageConstants, {setPageConstants} from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import {compileWorkspaceSource} from '../blockly/setup';
import defaultSources from '../defaultSources.json';
import {SCENES_UI_VARIANT} from '../experiments';
import spriteLab2Reducer, {
  setActiveSceneId,
  setActiveTab,
  setHasEdited,
  setScenes,
  SpriteLab2Tab,
} from '../redux/spriteLab2Redux';
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

  // Seed the animation list and (scenes variant) the scene list from saved
  // sources BEFORE the Code tab mounts (the Code tab is gated on
  // animationsSeeded below). The costume/background dropdown fields — and the
  // go-to-scene block's scene dropdown — validate their saved values against
  // the store at block-load time; loading blocks against empty lists nulls
  // every saved selection. This must be a render gate, not just dispatch
  // ordering: a child's mount effect (where the workspace loads blocks) runs
  // before any parent effect.
  useEffect(() => {
    dispatch(
      setInitialAnimationList(
        sourcesRef.current.animations || EMPTY_ANIMATION_LIST,
        // No v3 migration; the engine never runs the legacy share path.
        undefined as unknown as object,
        true /* isSpriteLab */
      )
    );
    if (SCENES_UI_VARIANT) {
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
    }
    setAnimationsSeeded(true);
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
        return;
      }
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

  // Start the live preview once the engine is ready, and wire the go-to-scene
  // block's runtime jump.
  useEffect(() => {
    if (engineReady) {
      if (engineRef.current) {
        engineRef.current.onGoToScene = (sceneId: string) =>
          runSceneRef.current(sceneId, true /* withFade */);
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
      <Playspace mode={playspaceMode} fadeTrigger={fadeTrigger} />

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
