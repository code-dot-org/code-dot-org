import {useTheme} from '@code-dot-org/component-library/common/contexts';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef} from 'react';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {LabProps} from '@cdo/apps/lab2/types';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import animationList, {
  setInitialAnimationList,
} from '@cdo/apps/p5lab/redux/animationList';
import spritelabInputList from '@cdo/apps/p5lab/redux/spritelabInput';
import textConsole from '@cdo/apps/p5lab/redux/textConsole';
import {registerReducers} from '@cdo/apps/redux';
import pageConstants from '@cdo/apps/redux/pageConstants';
import runState, {setIsRunning} from '@cdo/apps/redux/runState';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import defaultSources from '../defaultSources.json';
import spriteLab2Reducer, {
  setActiveTab,
  setHasEdited,
  setHasRun,
  SpriteLab2Tab,
} from '../redux/spriteLab2Redux';
import SpriteLab2Engine from '../SpriteLab2Engine';
import {SpriteLab2LevelProperties, SpriteLab2Source} from '../types';

import CodeTab, {CodeTabHandle} from './CodeTab';
import TabShell from './components/TabShell';
import PlayTab from './PlayTab';

import moduleStyles from './sprite-lab2-view.module.scss';

// Register the legacy Sprite Lab slices (animation list, console, run state,
// page constants, ...) plus our own. Lab2 shares the global getStore() store, so
// this gives the reused p5.play engine and (later) the AnimationTab the exact
// store shape they read from. Mirrors appMain.js's registerReducers calls.
registerReducers({
  animationList,
  textConsole,
  spritelabInputList,
  runState,
  pageConstants,
  spriteLab2: spriteLab2Reducer,
});

// Tabs wired so far. Items/World arrive in later phases.
const ENABLED_TABS: readonly SpriteLab2Tab[] = ['Code', 'Play'];

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

      {activeTab === 'Play' && (
        <div className={classNames(moduleStyles.codeTabWrapper)}>
          <PlayTab
            isRunning={isRunning}
            onRun={handleRun}
            onReset={handleReset}
          />
        </div>
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
