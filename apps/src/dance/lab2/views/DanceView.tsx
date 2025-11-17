import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import * as GoogleBlockly from 'blockly/core';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {loadBlocksToWorkspace} from '@cdo/apps/blockly/addons/cdoUtils';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {
  applyBlockIdOverrides,
  updateLocale,
  validateBlockCategories,
} from '@cdo/apps/blockly/utils';
import {
  getToolboxDefinition,
  workspaceToToolboxDefinition,
} from '@cdo/apps/blockly/utils/toolbox';
import {useMusicProject} from '@cdo/apps/bubbleChoice/customModes/MusicDanceAi/MusicProjectContext';
import {saveReplayLog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import defaultSources from '@cdo/apps/dance/blockly/defaultSources.json';
import {
  installSharedBlocks,
  setupBlocklyEnvironment,
} from '@cdo/apps/dance/blockly/setup';
import {
  loadSongs,
  reducers,
  setHasEdited,
  setHasRun,
  setIsRunning,
  setRunIsStarting,
  setSong,
} from '@cdo/apps/dance/danceRedux';
import LottieDancerRenderer from '@cdo/apps/dance/lottie/LottieDancerRenderer';
import {getFilterStatus} from '@cdo/apps/dance/songs';
import SongSelector from '@cdo/apps/dance/SongSelector';
import {
  DanceLevelProperties,
  DanceProjectSources,
  SongMetadata,
} from '@cdo/apps/dance/types';
import {TOOLBOX_BLOCKS} from '@cdo/apps/lab2/constants';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {
  getAppOptionsEditBlocks,
  getIsShareView,
} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {BlocklySource, LabProps} from '@cdo/apps/lab2/types';
import GuideInstructions from '@cdo/apps/lab2/views/components/guide/GuideInstructions';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import localization from '@cdo/apps/localization';
import {EVENTS} from '@cdo/apps/metrics/AnalyticsConstants';
import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {defaultMetadata} from '@cdo/apps/music/DefaultMusic';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';
import usePlaybackUpdate from '@cdo/apps/music/views/hooks/usePlaybackUpdate';
import MusicProjectBar from '@cdo/apps/music/views/MusicProjectBar';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import useReportAnalytics from '../hooks/useReportAnalytics';
import ProgramExecutor from '../ProgramExecutor';

import DanceControls from './DanceControls';
import DanceLoading from './DanceLoading';
import DanceShare from './DanceShare';
import DanceValidator from './DanceValidator';
import GenerateDance from './GenerateDance';
import GenerateDancer from './GenerateDancer';

import moduleStyles from './dance-view.module.scss';

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

const GENERATE_DANCE_PLAYBACK_MEASURES = 4;

registerReducers(reducers);

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

const isShareView = getIsShareView();

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent<{
  levelProperties: DanceLevelProperties;
}> = ({levelProperties}) => {
  const dispatch = useAppDispatch();

  const isRunning = useAppSelector(state => state.dance.isRunning);
  const userType = useAppSelector(state => state.currentUser.userType);
  const under13 = useAppSelector(state => state.currentUser.under13);
  const songData = useAppSelector(state => state.dance.songData);
  // isReadOnlyWorkspace should include share view, but avoiding affecting other labs right now.
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace) || isShareView;
  const currentSongMetadata = useAppSelector(
    state => state.dance.currentSongMetadata
  );
  const hasRun = useAppSelector(state => state.dance.hasRun);
  const hasEdited = useAppSelector(state => state.dance.hasEdited);
  const isLoading = useAppSelector(state => state.dance.isLoading);
  const signedIn = useAppSelector(state => state.currentUser.signInState);
  const scriptName = useAppSelector(state => state.progress.scriptName);

  const {
    currentSources,
    updateSources,
    showStartOverDialog,
    setReinitializationHandler,
    startOver,
  } = useSources<DanceProjectSources>();
  const programExecutor = useRef<ProgramExecutor | null>(null);
  const workspace = useRef<GoogleBlockly.Workspace | null>(null);

  const updateBlocklyFlyout = useCallback(
    (toolboxDefinition: GoogleBlockly.utils.toolbox.ToolboxInfo) => {
      const currentWorkspace = workspace.current;
      if (currentWorkspace && currentWorkspace.rendered) {
        (currentWorkspace as GoogleBlockly.WorkspaceSvg).updateToolbox(
          toolboxDefinition
        );
      }
    },
    []
  );

  const musicProjectPlayer = useRef<ProjectPlayer | null>(null);
  const [loadedMusicProject, setLoadedMusicProject] = useState(false);

  const guideMode = levelProperties.guideMode;
  const musicChannelId = useMusicProject();
  const usingMusicProject =
    guideMode === 'instructions' ||
    (guideMode === 'aiCodeGenerate' && !!musicChannelId);

  const {theme} = useTheme();

  const progressManager = useContext(ProgressManagerContext);

  const [musicPlayheadPosition, setMusicPlayheadPosition] = useState(1);

  const updateMusicPlayhead = useCallback(() => {
    if (usingMusicProject && musicProjectPlayer.current) {
      setMusicPlayheadPosition(
        musicProjectPlayer.current.getCurrentPlayheadPosition()
      );
    }
  }, [usingMusicProject]);

  usePlaybackUpdate(isRunning, updateMusicPlayhead);

  const metadataToUse: SongMetadata | undefined = useMemo(() => {
    if (!musicProjectPlayer.current || !loadedMusicProject) {
      return currentSongMetadata;
    }

    return {
      analysis: [],
      artist: '', // Unused
      bpm: musicProjectPlayer.current.getBpm().toString(),
      delay: '0',
      duration: 0, // Unused
      file: '', // Unused
      title: guideMode === 'instructions' ? 'Starter Beat' : 'My Music Mix',
      peaks: {},
    };
  }, [currentSongMetadata, loadedMusicProject, guideMode]);

  const WorkspaceAlert = useLevelEditMode<DanceLevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          if (workspace.current && workspace.current.rendered) {
            return {
              toolbox_definition: workspaceToToolboxDefinition(
                workspace.current as GoogleBlockly.WorkspaceSvg
              ),
            };
          }
        }

        if (mode === 'start' && Blockly.blockIdOverrides) {
          applyBlockIdOverrides(
            currentSources.source as WorkspaceSerialization,
            Blockly.blockIdOverrides
          );
        }
        return {
          [mode === 'start' ? 'start_sources' : 'exemplar_sources']:
            currentSources,
        };
      },
      [currentSources]
    )
  );

  const [filterOn, setFilterOn] = useState<boolean>(
    getFilterStatus(userType, under13)
  );

  const onAuthError = (songId: string) => {
    // TODO: Show page error if necessary
    Lab2Registry.getInstance().getMetricsReporter().logWarning({
      message: 'Error loading song',
      songId,
    });
  };

  const turnOffFilter = useCallback(() => setFilterOn(false), []);

  const onSetSong = useCallback(
    (songId: string) => {
      updateSources({...currentSources, selectedSong: songId});
    },
    [updateSources, currentSources]
  );

  const saveBlocks = useCallback(
    (forceSave = false) => {
      if (!workspace.current) {
        return;
      }
      const blocks = Blockly.serialization.workspaces.save(
        workspace.current
      ) as BlocklySource;
      updateSources({...currentSources, source: blocks}, forceSave);
    },
    [currentSources, updateSources]
  );

  const runProgram = useCallback(async () => {
    if (!hasRun) {
      const eventName = levelProperties.isProjectLevel
        ? EVENTS.PROJECT_ACTIVITY
        : EVENTS.LEVEL_ACTIVITY;

      analyticsReporter.sendEvent(eventName, {
        signedIn: signedIn,
        unitName: scriptName,
        levelId: levelProperties.id,
        levelName: levelProperties.name,
      });
    }

    if (!programExecutor.current || !metadataToUse || !workspace.current) {
      return;
    }

    // Set the runIsStartingFlag to true while the run function is executing,
    // and set the isRunning flag to true once the run actually starts.
    dispatch(setRunIsStarting(true));
    programExecutor.current.reset();
    await programExecutor.current.execute(
      Blockly.JavaScript.workspaceToCode(workspace.current),
      metadataToUse
    );
    dispatch(setRunIsStarting(false));
    dispatch(setIsRunning(true));
    dispatch(setHasRun(true));
    saveBlocks(true);

    progressManager?.resetValidation();
  }, [
    hasRun,
    metadataToUse,
    dispatch,
    saveBlocks,
    progressManager,
    levelProperties.isProjectLevel,
    levelProperties.id,
    levelProperties.name,
    signedIn,
    scriptName,
  ]);

  const resetProgram = useCallback(() => {
    programExecutor.current?.reset();
    dispatch(setIsRunning(false));
    setMusicPlayheadPosition(1);
    if (workspace.current) {
      programExecutor.current?.staticPreview(
        Blockly.JavaScript.workspaceToCode(workspace.current)
      );
    }
  }, [programExecutor, dispatch]);

  const onPuzzleComplete = useCallback(
    (result: boolean, message: string) => {
      resetProgram();
      // TODO: Handle puzzle complete.
      console.log(`onPuzzleComplete! pass?: ${result} message: ${message}`);
      if (result) {
        danceValidator.current.setCurrentCondition({name: 'pass'});
      } else {
        danceValidator.current.setCurrentCondition({name: message});
      }

      progressManager?.updateProgress();
    },
    [progressManager, resetProgram]
  );

  const onEventsChanged = () => {
    // TODO: Save project thumbnail when events change.
    console.log('onEventsChanged');
  };

  const onBlockSpaceChange = useCallback(
    (e: GoogleBlockly.Events.Abstract) => {
      if (
        isToolboxMode &&
        workspace.current &&
        workspace.current.rendered &&
        e.type === Blockly.Events.BLOCK_MOVE
      ) {
        validateBlockCategories(
          workspace.current as GoogleBlockly.WorkspaceSvg
        );
      }

      if (
        e.type !== GoogleBlockly.Events.BLOCK_DRAG &&
        e.type !== GoogleBlockly.Events.BLOCK_CHANGE
      ) {
        return;
      }

      if (
        e.type === GoogleBlockly.Events.BLOCK_DRAG &&
        (e as GoogleBlockly.Events.BlockDrag).isStart
      ) {
        return;
      }

      if (!isRunning && workspace.current) {
        programExecutor.current?.staticPreview(
          Blockly.JavaScript.workspaceToCode(workspace.current)
        );
      }
      saveBlocks();
      dispatch(setHasEdited(true));
    },
    [isRunning, dispatch, saveBlocks]
  );

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('blocks');
  }, [showStartOverDialog]);

  const onStartOver = useCallback(() => {
    progressManager?.resetValidation();
  }, [progressManager]);

  useEffect(() => {
    setReinitializationHandler(onStartOver);
  }, [onStartOver, setReinitializationHandler]);

  // Setup Blockly for dance party when first mounting.
  useEffect(setupBlocklyEnvironment, []);

  // Reset hasRun and hasEdited flag when level changes
  useEffect(() => {
    dispatch(setHasRun(false));
    dispatch(setHasEdited(false));
  }, [levelProperties.id, dispatch]);

  // Load or update song manifest when level properties change.
  useEffect(() => {
    dispatch(
      loadSongs({
        useRestrictedSongs: levelProperties.useRestrictedSongs || false,
        songSelection: levelProperties.songSelection || [],
      })
    );
  }, [
    levelProperties.useRestrictedSongs,
    levelProperties.songSelection,
    dispatch,
  ]);

  // Set up the Blockly workspace when the level changes
  useEffect(() => {
    const blocksByCategory = installSharedBlocks(
      levelProperties.sharedBlocks || []
    );

    // Ensure that Blockly localizes when the locale changes
    localization.on('change', info => {
      updateLocale(localization.rtl);
    });

    if (isShareView) {
      workspace.current = new GoogleBlockly.Workspace();
    } else {
      const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
      if (!blocklyDiv) {
        dispatch(setPageError({errorMessage: 'Blockly div not found'}));
        return;
      }
      const toolboxModeBlocks = {
        Categories: [BLOCK_TYPES.category, BLOCK_TYPES.categoryDynamic],
        ...blocksByCategory,
      };
      let toolbox = isToolboxMode
        ? getToolboxDefinition(toolboxModeBlocks, 'categoryToolbox')
        : levelProperties.toolboxDefinition;

      // Don't show the toolbox if it's empty
      if (toolbox?.contents?.length === 0) {
        toolbox = undefined;
      }

      workspace.current = Blockly.inject(blocklyDiv, {
        toolbox,
        theme: theme === 'Dark' ? cdoDark : cdoTheme,
        readOnly: readonlyWorkspace,
        editBlocks: getAppOptionsEditBlocks(),
        extraScrollheight: guideMode === 'aiCodeGenerate' ? 200 : 0,
      } as GoogleBlockly.BlocklyOptions);
    }

    return () => workspace.current?.dispose();
  }, [dispatch, guideMode, readonlyWorkspace, levelProperties, theme]);

  useEffect(() => {
    if (!workspace.current) {
      return;
    }
    const blocks = Blockly.serialization.workspaces.save(workspace.current);
    if (!isEqual(blocks, currentSources.source)) {
      loadBlocksToWorkspace(
        workspace.current as GoogleBlockly.WorkspaceSvg,
        JSON.stringify(currentSources.source)
      );
      // Provide extra scroll height to account for bottom-anchored guide overlay.
      if (guideMode === 'aiCodeGenerate') {
        Blockly.extraScrollHeight = 250;
      }
      const toolboxFromStorage = sessionStorage.getItem(
        `flyout-${levelProperties.id}`
      );
      // GenerateDance levels depend upon a generated toolbox.
      if (toolboxFromStorage) {
        try {
          const toolboxDefinition = JSON.parse(toolboxFromStorage);
          updateBlocklyFlyout(toolboxDefinition);
        } catch {}
      }
    }
  }, [
    currentSources.source,
    guideMode,
    levelProperties.id,
    updateBlocklyFlyout,
  ]);

  useEffect(() => {
    const songKeys = Object.keys(songData);
    if (songKeys.length === 0) {
      // Song data has not been loaded yet.
      return;
    }
    // In case there is no song set in the current sources, set it to the default.
    if (!currentSources.selectedSong) {
      const defaultSong = levelProperties.defaultSong;
      const songToUse =
        defaultSong && songData[defaultSong] ? defaultSong : songKeys[0];
      updateSources({...currentSources, selectedSong: songToUse});
    }
  }, [songData, currentSources, updateSources, levelProperties.defaultSong]);

  // Load the selected song whenever it changes in project sources.
  useEffect(() => {
    const songKeys = Object.keys(songData);
    if (songKeys.length === 0 || !currentSources.selectedSong) {
      return;
    }
    // Make sure the song is available
    const songId = songData[currentSources.selectedSong]
      ? currentSources.selectedSong
      : songKeys[0];
    dispatch(setSong({songId, onAuthError}));
  }, [dispatch, currentSources.selectedSong, levelProperties, songData]);

  useEffect(() => {
    workspace.current?.addChangeListener(onBlockSpaceChange);
    return () => workspace.current?.removeChangeListener(onBlockSpaceChange);
  }, [onBlockSpaceChange]);

  useEffect(() => {
    if (usingMusicProject) {
      musicProjectPlayer.current = new ProjectPlayer();

      // Use the default music if the level specifies.
      // Otherwise use the specific channel if provided.
      musicProjectPlayer.current
        .loadProject(
          guideMode === 'instructions'
            ? defaultMetadata.channelId
            : musicChannelId!
        )
        .then(() => setLoadedMusicProject(true))
        .catch(error => {
          dispatch(
            setPageError({
              errorMessage: 'Error loading music project',
              error,
              details: {channelId: musicChannelId},
            })
          );
        });
    }
  }, [usingMusicProject, musicChannelId, guideMode, dispatch]);

  // Set up the ProgramExecutor
  useEffect(() => {
    // Skip setting up the ProgramExecutor in toolbox mode as we are not running code.
    if (isToolboxMode) {
      return;
    }
    const {isProjectLevel, freePlay, customHelperLibrary, validationCode} =
      levelProperties;
    // record a replay log (and generate a video) for both project levels and any
    // course levels that have sharing enabled
    const recordReplayLog = isProjectLevel || freePlay || false;
    programExecutor.current = new ProgramExecutor({
      container: DANCE_VISUALIZATION_ID,
      onPuzzleComplete,
      isReadOnlyWorkspace: readonlyWorkspace,
      metricsReporter: Lab2Registry.getInstance().getMetricsReporter(),
      customHelperLibrary,
      validationCode,
      onEventsChanged,
      playSound: musicProjectPlayer.current
        ? (_url, callback) => {
            musicProjectPlayer.current?.play(resetProgram);
            callback(true);
          }
        : undefined,
      stopSound: musicProjectPlayer.current
        ? () => musicProjectPlayer.current?.stop()
        : undefined,
      onSoundEnded: resetProgram,
      externalRendererFactory: () => new LottieDancerRenderer(),
    });

    if (recordReplayLog) {
      dispatch(saveReplayLog(programExecutor.current.getReplayLog()));
    }
    resetProgram();

    return () => {
      programExecutor.current?.destroy();
    };
  }, [
    levelProperties,
    dispatch,
    resetProgram,
    onPuzzleComplete,
    readonlyWorkspace,
  ]);

  // Create dance validator.
  const danceValidator = useRef(new DanceValidator());

  // Pass dance validator to Progress Manager.
  useEffect(() => {
    if (guideMode === 'instructions' && progressManager) {
      progressManager.setValidator(danceValidator.current);
    }
  }, [progressManager, levelProperties.appName, guideMode]);

  const settings = useBlocklySettings();

  if (isShareView) {
    const musicMetadata = loadedMusicProject
      ? musicProjectPlayer.current?.getMetadata()
      : undefined;

    return (
      <DanceShare
        guideMode={guideMode}
        usingMusicProject={usingMusicProject}
        loadedMusicProject={loadedMusicProject}
        musicTitle={metadataToUse?.title}
        visualizationId={DANCE_VISUALIZATION_ID}
        isLoading={isLoading}
        musicMetadata={musicMetadata}
        isRunning={isRunning}
        musicPlayheadPosition={musicPlayheadPosition}
        runProgram={runProgram}
        resetProgram={resetProgram}
      />
    );
  }

  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      <div className={moduleStyles.mainContent}>
        {!getIsShareView() && !usingMusicProject && (
          <AgeDialog turnOffFilter={turnOffFilter} />
        )}
        <ResourcePanel
          isRunning={isRunning}
          hasRun={hasRun}
          hasEdited={hasEdited}
          levelProperties={levelProperties}
          headerClassName={moduleStyles.panelHeader}
          className={!guideMode ? moduleStyles.instructionsArea : ''}
          settings={settings}
          sidebarOnly={!!guideMode}
        />
        <div className={moduleStyles.divider} />
        {!isToolboxMode && (
          <PanelContainer
            id="visualization"
            headerContent="Dance"
            headerClassName={moduleStyles.panelHeader}
            className={classNames(
              moduleStyles.visualizationArea,
              guideMode && moduleStyles.jumbo
            )}
          >
            <div className={moduleStyles.visualizationColumn}>
              {!usingMusicProject && currentSources.selectedSong && (
                <SongSelector
                  enableSongSelection={!isRunning}
                  setSong={onSetSong}
                  selectedSong={currentSources.selectedSong}
                  songData={songData}
                  filterOn={filterOn}
                  levelIsRunning={isRunning}
                />
              )}
              {usingMusicProject && (
                <MusicProjectBar
                  isLoading={!loadedMusicProject}
                  title={metadataToUse?.title}
                />
              )}
              <div
                id={DANCE_VISUALIZATION_ID}
                className={moduleStyles.visualization}
              >
                <DanceLoading isLoading={isLoading} />
              </div>
              <DanceControls
                onRun={runProgram}
                onReset={resetProgram}
                disabled={(usingMusicProject && !loadedMusicProject) || false}
              />
            </div>
          </PanelContainer>
        )}
        <div className={moduleStyles.divider} />
        <PanelContainer
          id="dance-workspace-panel"
          headerContent={commonI18n.workspaceHeaderShort()}
          className={moduleStyles.workspaceArea}
          headerClassName={moduleStyles.panelHeader}
          rightHeaderContent={
            !readonlyWorkspace && (
              <Button
                text={commonI18n.startOver()}
                iconRight={{iconStyle: 'solid', iconName: 'refresh'}}
                color={'black'}
                onClick={onClickStartOver}
                ariaLabel={commonI18n.startOver()}
                size={'xs'}
                type="secondary"
              />
            )
          }
        >
          {WorkspaceAlert}
          <div id={BLOCKLY_DIV_ID} />
        </PanelContainer>
        {guideMode === 'instructions' && (
          <GuideInstructions
            isRunning={isRunning}
            hasRun={hasRun}
            hasEdited={hasEdited}
            levelProperties={levelProperties}
            width="narrow"
          />
        )}
        {guideMode === 'aiCodeGenerate' &&
          usingMusicProject &&
          musicProjectPlayer.current &&
          loadedMusicProject &&
          !getAppOptionsEditBlocks() && (
            <GenerateDance
              levelProperties={levelProperties}
              isRunning={isRunning}
              hasEdited={hasEdited}
              hasPlayedGeneratedDance={
                musicPlayheadPosition >=
                Math.min(
                  GENERATE_DANCE_PLAYBACK_MEASURES,
                  musicProjectPlayer.current.getLastMeasure() || 0
                )
              }
              measures={musicProjectPlayer.current.getEventMeasures()}
              blockDefinitions={levelProperties.sharedBlocks || []}
              blockCount={workspace.current?.getAllBlocks().length || 0}
              runProgram={runProgram}
              resetProgram={resetProgram}
              updateSources={resultBlockly => {
                updateSources({
                  ...currentSources,
                  source: resultBlockly,
                });
              }}
              startOver={startOver}
              updateBlocklyFlyout={updateBlocklyFlyout}
            />
          )}
      </div>
    </div>
  );
};

export default (props: LabProps<DanceLevelProperties, DanceProjectSources>) => {
  useReportAnalytics(props.levelProperties, props.channel?.id);

  return (
    <SourcesContainer
      {...props}
      defaultSources={defaultSources}
      key={props.levelProperties.id}
    >
      {props.levelProperties.guideMode === 'aiDancerGenerate' ? (
        <GenerateDancer
          adlibOption={
            props.levelProperties.aiDancerGenerateAdlib ||
            'adjective-animal-attire'
          }
          levelProperties={props.levelProperties}
        />
      ) : (
        <DanceView levelProperties={props.levelProperties} />
      )}
    </SourcesContainer>
  );
};
