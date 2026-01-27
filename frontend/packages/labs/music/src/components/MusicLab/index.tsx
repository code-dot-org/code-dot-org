import classNames from 'classnames';
import {useRef, useContext, useCallback, useMemo, useEffect} from 'react';

import {BlockTypes} from '../../blockly/blockTypes';
import {BlockMode} from '../../constants';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {getAppOptionsEditBlocks} from '@code-dot-org/api';
import {BlocklyWorkspace} from '@code-dot-org/blockly-workspace';
import type {
  Environment,
  BlocklySerialization,
} from '@code-dot-org/blockly-workspace';
import {
  GuideInstructions,
  LabConstants,
  PanelContainer,
  WorkspaceHeader,
} from '@code-dot-org/lab';
import blocks from '../../blockly/blocks/simple2';
import {useLevelProperties, useSources} from '@code-dot-org/lab/contexts';
import {useBlocklySettings} from '@code-dot-org/lab/hooks';
import type {ProjectSources} from '@code-dot-org/projects';
import Controls from '../Controls';
import Timeline from '../Timeline';
import HeaderButtons from '../HeaderButtons';
import PackDialog from '../PackDialog';
import ResourcePanel from '@code-dot-org/lab/resourcePanel';
import '@code-dot-org/lab/resourcePanel/index.css';
import '@code-dot-org/lab/index.css';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import {darkTheme} from '@code-dot-org/blockly-workspace/themes';
import toolboxes from '../../blockly/toolbox';

import ExemplarPlayerView from '../ExemplarPlayerView';

import AppConfig from '../../appConfig';
import PlayerContext from '../../contexts/PlayerContext';
import MusicPlayer from '../../player/MusicPlayer';
import type {PlaybackEvent} from '../../player/interfaces/PlaybackEvent';
import {InstructionsPosition, showCallout} from '../../redux/musicSlice';
import {useAppDispatch, useAppSelector} from '../../redux/store';
import {labActions} from '@code-dot-org/lab/redux';
import type {Trigger, MusicLevelProperties} from '../../types';

import moduleStyles from './musicLab.module.scss';

const DEFAULT_TOOLBOX = toolboxes[BlockMode.SIMPLE2];

const exemplarPlayerInsideInstructions =
  AppConfig.getValue('exemplar-player-bottom') !== 'true';

//const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
const isToolboxMode = getAppOptionsEditBlocks() === LabConstants.TOOLBOX_BLOCKS;

/** By default, a blank level should at least show a 'When Run' block */
const DefaultStartBlocks: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: BlockTypes.WHEN_RUN_SIMPLE2,
      },
    ],
  },
};

const MusicLab = () => {
  const settings = useBlocklySettings();
  const dispatch = useAppDispatch();

  const isStandaloneCollapsed = useAppSelector(
    state => state.labView.isStandaloneCollapsed,
  );

  const levelProperties = useLevelProperties<MusicLevelProperties>();
  console.log(useLevelProperties);

  const {currentSources} = useSources<BlocklySerialization>();
  console.log('SOURCES', currentSources);

  const {skipUrl} = levelProperties;
  const guideMode = levelProperties.levelData.guideMode;
  const startSources: ProjectSources = {
    source: 'hello world',
  };

  const {theme, setTheme} = useTheme();
  const timelineAreaRef = useRef<HTMLDivElement | null>(null);

  const hideChaff = useCallback(() => {}, []);
  const undo: () => void = () => {};
  const redo: () => void = () => {};
  const clearCode: (maintainPackId?: boolean) => void = _ => {};
  const allowPackSelection = true;
  const setPlaying: (_: boolean) => void = _ => {};
  const triggers: Trigger[] = [];
  const playTrigger: (id: string) => void = _ => {};

  const {loadAndInitializePlayer, onInject, onChange, javascriptGeneratorRef} =
    useContext(PlayerContext);

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
      loadAndInitializePlayer('launch2024');
    }
  }, [loadAndInitializePlayer, dispatch, theme, setTheme]);

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

  const toolboxBlocks = useMemo(
    () =>
      levelProperties.multipleChoice
        ? undefined
        : (levelProperties.toolboxBlocks?.contents?.length || 0) === 0
          ? DEFAULT_TOOLBOX
          : levelProperties.toolboxBlocks,
    [levelProperties],
  );

  console.log('toolbox', toolboxBlocks);

  const timelineAtTop = useAppSelector(state => state.music.timelineAtTop);
  const hideHeaders = useAppSelector(state => state.music.hideHeaders);
  const instructionsPosition = useAppSelector(
    state => state.music.instructionsPosition,
  );

  const hasRun = false;
  const hasEdited = false;
  const isPlaying = false;
  const showExemplarPlayer = false;
  const exemplarPlaybackEvents: PlaybackEvent[] = [];
  const player: MusicPlayer = new MusicPlayer();

  console.log(allowPackSelection, player);

  return (
    <div className={moduleStyles.musicLab}>
      <div
        className={classNames(
          moduleStyles.mainContent,
          timelineAtTop && moduleStyles.reverse,
        )}
      >
        {allowPackSelection && (
          <PackDialog
            player={player}
            forcePackSelect={guideMode === 'aiCodeGenerate'}
          />
        )}
        {guideMode === 'instructions' && (
          <GuideInstructions
            levelProperties={levelProperties}
            isRunning={false}
            hasRun={false}
            hasEdited={false}
          />
        )}
        <div
          id="work-area"
          className={classNames(moduleStyles.workArea, {
            // Allow full height when the play area is hidden.
            [moduleStyles.toolboxMode]: isToolboxMode,
            [moduleStyles.reverse]:
              instructionsPosition === InstructionsPosition.RIGHT,
          })}
        >
          <div
            id="instructions-area"
            className={classNames(
              moduleStyles.instructionsArea,
              moduleStyles.instructionsSide,
              (isStandaloneCollapsed || guideMode) &&
                moduleStyles.instructionsCollapsed,
            )}
          >
            <ResourcePanel
              isRunning={isPlaying}
              onInstructionsTextClick={onInstructionsTextClick}
              bottomComponent={
                exemplarPlayerInsideInstructions &&
                showExemplarPlayer && (
                  <ExemplarPlayerView
                    playbackEvents={exemplarPlaybackEvents}
                    title={
                      levelProperties.levelData.exemplarSettings!.playerTitle!
                    }
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
          </div>

          <div id="blockly-area" className={moduleStyles.blocklyArea}>
            <PanelContainer
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
              <BlocklyWorkspace<Environment>
                className={moduleStyles.blocklyWorkspace}
                options={{
                  readOnly: levelProperties.multipleChoice ? true : undefined,
                }}
                startBlocks={
                  currentSources?.source ||
                  levelProperties.template?.startBlocks ||
                  levelProperties.startBlocks ||
                  DefaultStartBlocks
                }
                blocks={blocks}
                toolboxBlocks={toolboxBlocks}
                theme={darkTheme}
                renderer={ThrasosRenderer}
                onInject={onInject}
                onChange={onChange}
                javascriptGeneratorRef={javascriptGeneratorRef}
                plugins={[ToolboxTrashcanPlugin]}
              />
            </PanelContainer>
          </div>
        </div>

        {!isToolboxMode && (
          <div id="play-area" className={classNames(moduleStyles.playArea)}>
            <div id="controls-area" className={moduleStyles.controlsArea}>
              <PanelContainer
                id="controls-panel"
                headerContent="Controls"
                hideHeaders={hideHeaders}
              >
                <Controls
                  setPlaying={setPlaying}
                  playTrigger={playTrigger}
                  triggers={triggers}
                  isPredictLevel={
                    levelProperties.predictSettings?.isPredictLevel
                  }
                  enableSkipControls={
                    AppConfig.getValue('skip-controls-enabled') === 'true'
                  }
                />
              </PanelContainer>
            </div>

            <div
              dir="ltr"
              id="timeline-area"
              className={moduleStyles.timelineArea}
              ref={timelineAreaRef}
            >
              <PanelContainer
                id="timeline-panel"
                headerContent="Timeline"
                hideHeaders={hideHeaders}
              >
                <Timeline
                  allowChangeStartingPlayheadPosition={
                    levelProperties.levelData
                      ?.allowChangeStartingPlayheadPosition
                  }
                  isPredictLevel={
                    levelProperties.predictSettings?.isPredictLevel
                  }
                />
              </PanelContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicLab;
