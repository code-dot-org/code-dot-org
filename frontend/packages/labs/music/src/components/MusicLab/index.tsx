import classNames from 'classnames';
import {useRef, useContext, useCallback, useMemo, useEffect} from 'react';

import {BlockTypes} from '../../blockly/blockTypes';
import {
  BlockMode,
  DEFAULT_LIBRARY,
  LEGACY_DEFAULT_LIBRARY,
} from '../../constants';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {
  BlocklyWorkspace,
  ScrollBlockDragger,
  TopLeftMetricsManager,
} from '@code-dot-org/blockly';
import type {BlocklySerialization} from '@code-dot-org/blockly';
import {
  GuideInstructions,
  Layout,
  Panel,
  PanelContainer,
  WorkspaceHeader,
} from '@code-dot-org/lab/components';
import {useLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {useBlocklySettings} from '@code-dot-org/lab/hooks';
import type {ProjectSources} from '@code-dot-org/core/api';
import Callouts from '../Callouts';
import Controls from '../Controls';
import Timeline from '../Timeline';
import HeaderButtons from '../HeaderButtons';
import PackDialog from '../PackDialog';
import ResourcePanel from '@code-dot-org/lab/resourcePanel';
import {getToolbox} from '../../blockly/toolbox';

import ExemplarPlayerView from '../ExemplarPlayerView';

import AppConfig from '../../appConfig';
import PlayerContext from '../../contexts/PlayerContext';
import type {PlaybackEvent} from '../../player/interfaces/PlaybackEvent';
import MusicLibrary from '../../player/MusicLibrary';
import {
  InstructionsPosition,
  setPackId,
  showCallout,
} from '../../redux/musicSlice';
import {useAppDispatch, useAppSelector} from '../../redux/store';
import {labActions} from '@code-dot-org/lab/redux';
import type {Trigger, MusicLevelProperties} from '../../types';

import moduleStyles from './musicLab.module.scss';

const exemplarPlayerInsideInstructions =
  AppConfig.getValue('exemplar-player-bottom') !== 'true';

// TODO: use AppOptions api;
//const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
//const isToolboxMode = getAppOptionsEditBlocks() === LabConstants.TOOLBOX_BLOCKS;
const isToolboxMode = false;

/** By default, a blank level should at least show a 'When Run' block */
const DefaultStartBlocks: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: BlockTypes.WHEN_RUN_SIMPLE2,
        // The "when run" hat is the fixed root: not deletable or movable
        // (matches legacy startSourcesSimple2.json).
        deletable: false,
        movable: false,
      },
    ],
  },
};

const MusicLab = () => {
  const settings = useBlocklySettings();
  const dispatch = useAppDispatch();

  const levelProperties = useLevelProperties<MusicLevelProperties>();

  const {currentSources, updateSources} = useSources<BlocklySerialization>();

  const {skipUrl} = levelProperties;
  const guideMode = levelProperties.levelData.guideMode;
  const startSources: ProjectSources = {
    source: 'hello world',
  };

  const {theme, setTheme} = useTheme();
  const timelineAreaRef = useRef<HTMLDivElement | null>(null);

  const {
    loadAndInitializePlayer,
    onInject,
    onChange,
    javascriptGeneratorRef,
    driver,
    player,
    library,
  } = useContext(PlayerContext);

  const hideChaff = useCallback(() => {}, []);
  const undo = useCallback(() => !!driver?.undo(), [driver]);
  const redo = useCallback(() => !!driver?.redo(), [driver]);
  const isReadOnly = useAppSelector(labActions.isReadOnlyWorkspace);
  // The student may pick a pack only when the library offers a choice, the
  // level did not fix one, and the workspace is editable. A level-fixed pack
  // (levelData.packId) renders as static art, not the "change pack" button.
  const allowPackSelection =
    !!MusicLibrary.getInstance()?.getHasRestrictedPacks() &&
    !levelProperties.levelData?.packId &&
    !isReadOnly;
  const setPlaying = useCallback(
    (play: boolean) => driver?.setPlaying(play),
    [driver],
  );

  // The level's authored starting workspace, falling back to the default "when
  // run" block. Matches legacy getStartSources, which reads levelData.startSources.
  const levelStartBlocks: BlocklySerialization =
    levelProperties.levelData?.startSources ||
    levelProperties.startBlocks ||
    DefaultStartBlocks;

  // "Start Over" confirm handler. Resets the workspace to the level's start
  // blocks, clears the pack (which re-opens the picker) unless the level fixed
  // one or we're told to keep it, and stops playback.
  const clearCode = useCallback(
    (maintainPackId?: boolean) => {
      // Reset the live workspace, then persist the reset sources.
      driver?.loadCode(levelStartBlocks);
      updateSources({source: levelStartBlocks});

      if (!levelProperties.levelData?.packId && !maintainPackId) {
        dispatch(setPackId(null));
        MusicLibrary.getInstance()?.setCurrentPackId(null);
      }
      setPlaying(false);
    },
    [
      levelStartBlocks,
      levelProperties,
      driver,
      updateSources,
      dispatch,
      setPlaying,
    ],
  );
  const triggers: Trigger[] = [];
  const playTrigger: (id: string) => void = _ => {};

  useEffect(() => {
    // Ensure we use dark theme for music lab, for now
    if (theme === 'Light') {
      setTheme('Dark');

      // TODO: add a channel/progress wrapper for offline levels
      dispatch(
        labActions.setChannel({
          id: '1',
          name: 'my-channel',
          isOwner: true,
          projectType: 'music',
          createdAt: '2026-01-01',
          updatedAt: '2026-01-01',
          hidden: false,
        }),
      );
      // Load the library the level asks for (mapping the legacy 'default'
      // alias), rather than a hardcoded one.
      let libraryName = levelProperties.levelData?.library;
      if (libraryName === LEGACY_DEFAULT_LIBRARY) {
        libraryName = DEFAULT_LIBRARY;
      }
      loadAndInitializePlayer(libraryName || DEFAULT_LIBRARY);
    }
  }, [loadAndInitializePlayer, dispatch, theme, setTheme, levelProperties]);

  // Set up the driver
  useEffect(() => {
    return () => {
      console.log('UNINIT THE MUSIC LEVEL');
    };
  }, [levelProperties]);

  const onInstructionsTextClick = useCallback(
    (id: string) => {
      dispatch(showCallout(id));
    },
    [dispatch],
  );

  // Once the library is loaded, reflect a level-fixed pack into redux so the
  // header shows it. (The library itself is filtered to the pack by the driver.)
  useEffect(() => {
    const packId = levelProperties.levelData?.packId;
    if (library && packId) {
      dispatch(setPackId(packId));
    }
  }, [library, levelProperties, dispatch]);

  const toolbox = useMemo(
    () =>
      levelProperties.multipleChoice
        ? undefined
        : getToolbox(BlockMode.SIMPLE2, levelProperties.levelData?.toolbox),
    // `library` is a dependency because the flyout blocks' field defaults (e.g.
    // FieldSounds' default sound) are resolved from the library when the blocks
    // are built; recomputing rebuilds the flyout once the library has loaded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [levelProperties, library],
  );

  const timelineAtTop = useAppSelector(state => state.music.timelineAtTop);
  const hideHeaders = useAppSelector(state => state.music.hideHeaders);
  const instructionsPosition = useAppSelector(
    state => state.music.instructionsPosition,
  );

  const hasRun = false;
  const hasEdited = false;
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const showExemplarPlayer = false;
  const exemplarPlaybackEvents: PlaybackEvent[] = [];

  return (
    <Layout
      className={classNames(
        moduleStyles.mainContent,
        timelineAtTop && moduleStyles.reverse,
      )}
    >
      {allowPackSelection && player && (
        <PackDialog
          player={player}
          forcePackSelect={guideMode === 'aiCodeGenerate'}
        />
      )}
      {/* Visual hint arrows shown when instruction text is clicked. */}
      <Callouts />
      {guideMode === 'instructions' && (
        <GuideInstructions
          levelProperties={levelProperties}
          isRunning={false}
          hasRun={false}
          hasEdited={false}
        />
      )}
      <Panel
        id="work-area"
        className={classNames(moduleStyles.workArea, {
          // Allow full height when the play area is hidden.
          [moduleStyles.toolboxMode]: isToolboxMode,
          [moduleStyles.reverse]:
            instructionsPosition === InstructionsPosition.RIGHT,
        })}
      >
        <ResourcePanel
          isRunning={isPlaying}
          onInstructionsTextClick={onInstructionsTextClick}
          bottomComponent={
            exemplarPlayerInsideInstructions &&
            showExemplarPlayer &&
            player && (
              <ExemplarPlayerView
                playbackEvents={exemplarPlaybackEvents}
                title={levelProperties.levelData.exemplarSettings!.playerTitle!}
                player={player}
                insideInstructions={exemplarPlayerInsideInstructions}
              />
            )
          }
          hasRun={hasRun}
          hasEdited={hasEdited}
          fixedDarkBackground={true}
          overrideTheme={'Light'}
          includeFooterSpacing={false}
          levelProperties={levelProperties}
          headerClassName={moduleStyles.headerWithBorder}
          settings={settings}
          hideContinueIfDisabled={true}
          hideNavigation={false}
          styleNavigationAsBubble={true}
          documentationUrl={'/docs/ide/music'}
          sidebarOnly={!!guideMode}
          versionHistoryProps={{startSources, alwaysShowAutoSaves: true}}
        />
        <PanelContainer
          className={moduleStyles.blocklyArea}
          id="workspace-panel"
          headerContent={<WorkspaceHeader />}
          hideHeaders={hideHeaders}
          rightHeaderContent={
            <HeaderButtons
              onClickUndo={undo}
              onClickRedo={redo}
              clearCode={clearCode}
              allowPackSelection={allowPackSelection}
              skipUrl={skipUrl}
              hideChaff={hideChaff}
            />
          }
          headerClassName={moduleStyles.headerWithBorder}
        >
          <BlocklyWorkspace
            className={moduleStyles.blocklyWorkspace}
            options={{
              readOnly: levelProperties.multipleChoice ? true : undefined,
              trashcan: false,
              // Match legacy's move config verbatim: wheel + drag panning with
              // scrollbars enabled. Note the top-level `scrollbars: true`
              // shortcut instead defaults `move.wheel` to false (no wheel pan),
              // so the `move` object is set explicitly. Because
              // TopLeftMetricsManager bounds the scroll area to the content,
              // Blockly auto-hides the scrollbars when everything fits and shows
              // them only once a block is off-screen.
              move: {
                wheel: true,
                drag: true,
                scrollbars: {horizontal: true, vertical: true},
              },
              plugins: {
                metricsManager: TopLeftMetricsManager,
                blockDragger: ScrollBlockDragger,
              },
            }}
            startBlocks={
              // An empty source is the truthy `{}` (a new/empty project), which
              // would otherwise win this `||` chain and skip the defaults. Only
              // use it when it actually has blocks; otherwise fall back to the
              // level's authored start blocks (or the default "when run" block).
              (currentSources?.source &&
              Object.keys(currentSources.source).length
                ? currentSources.source
                : undefined) || levelStartBlocks
            }
            toolbox={toolbox}
            onInject={onInject}
            onChange={onChange}
            javascriptGeneratorRef={javascriptGeneratorRef}
          />
        </PanelContainer>
      </Panel>

      {!isToolboxMode && (
        <Panel id="play-area" className={classNames(moduleStyles.playArea)}>
          <PanelContainer
            className={moduleStyles.controlsArea}
            id="controls-panel"
            headerContent="Controls"
            hideHeaders={hideHeaders}
          >
            <Controls
              setPlaying={setPlaying}
              playTrigger={playTrigger}
              triggers={triggers}
              isPredictLevel={levelProperties.predictSettings?.isPredictLevel}
              enableSkipControls={
                AppConfig.getValue('skip-controls-enabled') === 'true'
              }
            />
          </PanelContainer>
          <PanelContainer
            className={moduleStyles.timelineArea}
            id="timeline-panel"
            headerContent="Timeline"
            hideHeaders={hideHeaders}
            ref={timelineAreaRef}
          >
            <Timeline
              allowChangeStartingPlayheadPosition={
                levelProperties.levelData?.allowChangeStartingPlayheadPosition
              }
              isPredictLevel={levelProperties.predictSettings?.isPredictLevel}
            />
          </PanelContainer>
        </Panel>
      )}
    </Layout>
  );
};

export default MusicLab;
