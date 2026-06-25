import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';
import {Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {LabProps} from '@cdo/apps/lab2/types';
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
import {AiChatClientTypes} from '@cdo/generated-scripts/sharedConstants';

import defaultSources from '../defaultSources.json';
import spriteLab2Reducer, {
  setActiveTab,
  setHasEdited,
  SpriteLab2Tab,
} from '../redux/spriteLab2Redux';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {SpriteLab2LevelProperties, SpriteLab2Source} from '../types';
import {createEmptyGrid} from '../world/gridConstants';

import CodeTab, {CodeTabHandle} from './CodeTab';
import TabShell from './components/TabShell';
import GenerateSpriteLab from './GenerateSpriteLab';
import ItemsTab from './ItemsTab';
import Playspace, {PlayspaceMode} from './Playspace';
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

const ENABLED_TABS: readonly SpriteLab2Tab[] = [
  'Images',
  'World',
  'Code',
  'Play',
];

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

  // Instantiate the p5.play engine once, seeding the animation list from saved
  // sources. Unlike classic Sprite Lab we don't auto-load the legacy default
  // sprite library; SpriteLab2 sprites come from the Items tab (AI generation,
  // the image editor, or the animation picker), so a new project starts with an
  // empty list. p5 preload then completes immediately instead of blocking on
  // remote default-sprite assets.
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
      dispatch(
        setInitialAnimationList(
          savedAnimations,
          // No v3 migration; the engine never runs the legacy share path.
          undefined as unknown as object,
          true /* isSpriteLab */
        )
      );
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

  // Start the live preview once the engine is ready.
  useEffect(() => {
    if (engineReady) {
      runProgram();
    }
  }, [engineReady, runProgram]);

  const handleSourceChange = useCallback(
    (
      source: WorkspaceSerialization,
      toolbox?: SpriteLab2Source['toolboxDefinition']
    ) => {
      mergeSources({source, toolboxDefinition: toolbox});
      // Keep the live preview in sync with the edited code.
      scheduleRun();
    },
    [mergeSources, scheduleRun]
  );

  const handleEdit = useCallback(() => {
    dispatch(setHasEdited(true));
  }, [dispatch]);

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

  return (
    <TabShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      enabledTabs={ENABLED_TABS}
    >
      {/* Keep the Code tab mounted so the Blockly workspace survives switches. */}
      <div
        className={moduleStyles.codeTabWrapper}
        style={{
          clipPath: activeTab === 'Code' ? 'none' : 'inset(100%)',
          pointerEvents: activeTab === 'Code' ? 'auto' : 'none',
        }}
      >
        <CodeTab
          ref={codeTabRef}
          initialSource={
            currentSources.source as WorkspaceSerialization | undefined
          }
          toolboxDefinition={levelProperties.toolboxDefinition}
          toolboxXml={levelProperties.toolbox}
          sharedBlocks={levelProperties.sharedBlocks}
          theme={theme === 'Dark' ? 'Dark' : 'Light'}
          onSourceChange={handleSourceChange}
          onEdit={handleEdit}
        />
      </div>

      {activeTab === 'Images' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <ItemsTab />
        </div>
      )}

      {activeTab === 'World' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <WorldTab grid={worldGrid} onGridChange={handleWorldGridChange} />
        </div>
      )}

      {/* The single, persistent playspace: a live preview pinned to the
          top-right on the Code tab, animating to a large centered view on the
          Play tab. Always mounted so the engine keeps running. */}
      <Playspace mode={playspaceMode} />

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
