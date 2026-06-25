import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef} from 'react';
import {AnyAction, Reducer} from 'redux';

import AichatContextManager from '@cdo/apps/aichat/aichatContextManager';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {LabProps} from '@cdo/apps/lab2/types';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import {changeInterfaceMode} from '@cdo/apps/p5lab/actions';
import {P5LabInterfaceMode} from '@cdo/apps/p5lab/constants';
import * as p5labReducersModule from '@cdo/apps/p5lab/reducers';
import {setInitialAnimationList} from '@cdo/apps/p5lab/redux/animationList';
// p5lab/reducers is a CommonJS bundle of all the classic Sprite Lab slices;
// pull the ones the engine and AnimationTab read from it by key.
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
  setHasRun,
  SpriteLab2Tab,
} from '../redux/spriteLab2Redux';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {SpriteLab2LevelProperties, SpriteLab2Source} from '../types';
import {createEmptyGrid} from '../world/gridConstants';

import CodeTab, {CodeTabHandle} from './CodeTab';
import TabShell from './components/TabShell';
import GenerateSpriteLab from './GenerateSpriteLab';
import ItemsTab from './ItemsTab';
import PlayTab from './PlayTab';
import WorldTab from './WorldTab';

import moduleStyles from './sprite-lab2-view.module.scss';

const p5labReducers = p5labReducersModule as unknown as Record<string, Reducer>;

// Register the legacy Sprite Lab slices (animation list + the animation-editor
// slices AnimationTab reads, console, run state, page constants, ...) plus our
// own. Lab2 shares the global getStore() store, so this gives the reused
// p5.play engine and the classic AnimationTab the exact store shape they read
// from. Mirrors appMain.js's registerReducers calls.
registerReducers({
  animationList: p5labReducers.animationList,
  animationTab: p5labReducers.animationTab,
  animationPicker: p5labReducers.animationPicker,
  locationPicker: p5labReducers.locationPicker,
  errorDialogStack: p5labReducers.errorDialogStack,
  interfaceMode: p5labReducers.interfaceMode,
  textConsole: p5labReducers.textConsole,
  spritelabInputList: p5labReducers.spritelabInputList,
  // PiskelEditor's connect reads state.locales.localeCode.
  locales: p5labReducers.locales,
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

  const isRunning = useAppSelector(state => state.runState.isRunning);
  const activeTab = useAppSelector(state => state.spriteLab2.activeTab);
  const channelId = useAppSelector(state => state.lab.channel?.id);
  const currentLevelId = useAppSelector(state => state.progress.currentLevelId);
  const scriptId = useAppSelector(state => state.progress.scriptId);
  // The classic AnimationTab + animationList logic key off these page
  // constants (Sprite Lab is a Blockly lab); seed them since we bypass the
  // legacy StudioApp.init that normally would. Also populate the process-wide
  // AichatContextManager that the aiGateway image-generation calls read from.
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
    // AnimationTab shows currentAnimations[interfaceMode]; the Items tab is the
    // animation editor, so keep it in ANIMATION mode.
    // changeInterfaceMode is an untyped JS action creator (inferred as
    // Function), so cast its returned action for dispatch.
    dispatch(
      changeInterfaceMode(P5LabInterfaceMode.ANIMATION) as unknown as AnyAction
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
    };

    setup();

    return () => {
      cancelled = true;
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

  const handleRun = useCallback(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    const code = codeTabRef.current?.getCode() || '';
    dispatch(setIsRunning(true));
    dispatch(setHasRun(true));
    engine.run(code);
  }, [dispatch]);

  const handleReset = useCallback(() => {
    dispatch(setIsRunning(false));
    engineRef.current?.resetRuntime();
  }, [dispatch]);

  const handleSourceChange = useCallback(
    (
      source: WorkspaceSerialization,
      toolbox?: SpriteLab2Source['toolboxDefinition']
    ) => {
      mergeSources({source, toolboxDefinition: toolbox});
    },
    [mergeSources]
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

  const handleTabChange = useCallback(
    (tab: SpriteLab2Tab) => {
      // Leaving Play stops the engine's tick loop so it isn't burning CPU
      // behind another tab.
      if (activeTab === 'Play' && tab !== 'Play') {
        dispatch(setIsRunning(false));
        engineRef.current?.resetRuntime();
      }
      dispatch(setActiveTab(tab));
    },
    [activeTab, dispatch]
  );

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

      {activeTab === 'Play' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <PlayTab
            isRunning={isRunning}
            onRun={handleRun}
            onReset={handleReset}
          />
        </div>
      )}

      {/* Lab2 Guide overlay (Music-style), driven by the level's guideMode. */}
      {levelProperties.guideMode && (
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
