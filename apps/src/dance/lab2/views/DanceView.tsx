import {Button} from '@code-dot-org/component-library/button';
import {useTheme} from '@code-dot-org/component-library/common/contexts';
import {BlocklyOptions, Events, WorkspaceSvg} from 'blockly/core';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {loadBlocksToWorkspace} from '@cdo/apps/blockly/addons/cdoUtils';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
import cdoDark from '@cdo/apps/blockly/themes/cdoDark';
import cdoTheme from '@cdo/apps/blockly/themes/cdoTheme';
import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {
  applyBlockIdOverrides,
  validateBlockCategories,
} from '@cdo/apps/blockly/utils';
import {
  getToolboxDefinition,
  workspaceToToolboxDefinition,
} from '@cdo/apps/blockly/utils/toolbox';
import {saveReplayLog} from '@cdo/apps/code-studio/components/shareDialogRedux';
import {queryParams} from '@cdo/apps/code-studio/utils';
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
import {
  getAppOptionsEditBlocks,
  getIsShareView,
} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {BlocklySource, LabProps} from '@cdo/apps/lab2/types';
import Guide from '@cdo/apps/lab2/views/components/guide/Guide';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import SourcesContainer, {
  useSources,
} from '@cdo/apps/lab2/views/SourcesContainer';
import ProjectPlayer from '@cdo/apps/music/ProjectPlayer';
import MusicProjectBar from '@cdo/apps/music/views/MusicProjectBar';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import loadingGif from '@cdo/static/dance/DancePartyLoading.gif';

import buildDanceBlockly from '../../blockly/buildDanceBlockly';
import danceI18n from '../locale';
import ProgramExecutor from '../ProgramExecutor';

import DanceControls from './DanceControls';
import GenerateDancer from './GenerateDancer';

import moduleStyles from './dance-view.module.scss';

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

registerReducers(reducers);

const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;

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
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const currentSongMetadata = useAppSelector(
    state => state.dance.currentSongMetadata
  );
  const hasRun = useAppSelector(state => state.dance.hasRun);
  const hasEdited = useAppSelector(state => state.dance.hasEdited);
  const isLoading = useAppSelector(state => state.dance.isLoading);

  const {currentSources, updateSources, showStartOverDialog} =
    useSources<DanceProjectSources>();

  const programExecutor = useRef<ProgramExecutor | null>(null);
  const workspace = useRef<WorkspaceSvg | null>(null);
  const musicProjectPlayer = useRef<ProjectPlayer | null>(null);
  const [loadedMusicProject, setLoadedMusicProject] = useState(false);
  const [generatedAiDance, setGeneratedAiDance] = useState(false);

  const aiGenerateMode =
    levelProperties.aiCodeGenerate || queryParams('ai-generate') === 'true';
  const usingMusicProject = queryParams('music-channel') || aiGenerateMode;

  const {theme} = useTheme();

  const metadataToUse: SongMetadata | undefined = useMemo(() => {
    if (!musicProjectPlayer.current || !loadedMusicProject) {
      return currentSongMetadata;
    }

    return {
      analysis: [],
      artist: 'A.I.', // TODO: user's name?
      bpm: musicProjectPlayer.current.getBpm().toString(),
      delay: '0',
      duration: 0, // Unused
      file: '', // Unused
      title: 'My A.I. Remix', // TODO: what should this be?
      peaks: {},
    };
  }, [currentSongMetadata, loadedMusicProject]);

  const WorkspaceAlert = useLevelEditMode<DanceLevelProperties>(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          if (workspace.current) {
            return {
              toolbox_definition: workspaceToToolboxDefinition(
                workspace.current
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
    if (!programExecutor.current || !metadataToUse) {
      return;
    }

    // Set the runIsStartingFlag to true while the run function is executing,
    // and set the isRunning flag to true once the run actually starts.
    dispatch(setRunIsStarting(true));
    programExecutor.current.reset();
    await programExecutor.current.execute(
      Blockly.getWorkspaceCode(),
      metadataToUse
    );
    dispatch(setRunIsStarting(false));
    dispatch(setIsRunning(true));
    dispatch(setHasRun(true));
    saveBlocks(true);
  }, [programExecutor, metadataToUse, saveBlocks, dispatch]);

  const resetProgram = useCallback(() => {
    programExecutor.current?.reset();
    dispatch(setIsRunning(false));
    programExecutor.current?.staticPreview(Blockly.getWorkspaceCode());
  }, [programExecutor, dispatch]);

  const onPuzzleComplete = useCallback(
    (result: boolean, message: string) => {
      resetProgram();
      // TODO: Handle puzzle complete.
      console.log(`onPuzzleComplete! pass?: ${result} message: ${message}`);
    },
    [resetProgram]
  );

  const onEventsChanged = () => {
    // TODO: Save project thumbnail when events change.
    console.log('onEventsChanged');
  };

  const onBlockSpaceChange = useCallback(
    (e: Events.Abstract) => {
      if (
        isToolboxMode &&
        workspace.current &&
        e.type === Blockly.Events.BLOCK_MOVE
      ) {
        validateBlockCategories(workspace.current);
      }

      if (e.type !== Events.BLOCK_DRAG && e.type !== Events.BLOCK_CHANGE) {
        return;
      }

      if (e.type === Events.BLOCK_DRAG && (e as Events.BlockDrag).isStart) {
        return;
      }

      if (!isRunning) {
        programExecutor.current?.staticPreview(Blockly.getWorkspaceCode());
      }
      saveBlocks();
      dispatch(setHasEdited(true));
    },
    [isRunning, dispatch, saveBlocks]
  );

  const onClickStartOver = useCallback(() => {
    showStartOverDialog('blocks');
  }, [showStartOverDialog]);

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
    const blocklyDiv = document.getElementById(BLOCKLY_DIV_ID);
    if (!blocklyDiv) {
      dispatch(setPageError({errorMessage: 'Blockly div not found'}));
      return;
    }
    const blocksByCategory = installSharedBlocks(
      levelProperties.sharedBlocks || []
    );
    const toolboxModeBlocks = {
      Categories: [BLOCK_TYPES.category, BLOCK_TYPES.categoryDynamic],
      ...blocksByCategory,
    };
    const toolbox = isToolboxMode
      ? getToolboxDefinition(toolboxModeBlocks, 'categoryToolbox')
      : levelProperties.toolboxDefinition;

    workspace.current = Blockly.inject(blocklyDiv, {
      toolbox: aiGenerateMode ? undefined : toolbox,
      theme: theme === 'Dark' ? cdoDark : cdoTheme,
      readOnly: readonlyWorkspace,
      editBlocks: getAppOptionsEditBlocks(),
    } as BlocklyOptions);

    return () => workspace.current?.dispose();
  }, [dispatch, readonlyWorkspace, levelProperties, aiGenerateMode, theme]);

  useEffect(() => {
    if (!workspace.current) {
      return;
    }
    const blocks = Blockly.serialization.workspaces.save(workspace.current);
    if (!isEqual(blocks, currentSources.source)) {
      loadBlocksToWorkspace(
        workspace.current,
        JSON.stringify(currentSources.source)
      );
    }
  }, [currentSources.source]);

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
      musicProjectPlayer.current
        .loadProject(
          // Use the specific channel if provided. Otherwise
          // just pass a dummy string as we expect to find a music
          // project in local storage.
          (queryParams('music-channel') as string) || 'local-storage',
          aiGenerateMode
        )
        .then(() => setLoadedMusicProject(true));
    }
  }, [usingMusicProject, aiGenerateMode]);

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

  const generateAiDance = useCallback(() => {
    if (
      !usingMusicProject ||
      !musicProjectPlayer.current ||
      !loadedMusicProject
    ) {
      return;
    }

    setGeneratedAiDance(false);
    const resultBlockly = buildDanceBlockly(
      musicProjectPlayer.current.getEventMeasures(),
      levelProperties.sharedBlocks || []
    );
    updateSources({
      ...currentSources,
      source: resultBlockly,
    });
    setGeneratedAiDance(true);
  }, [
    currentSources,
    updateSources,
    loadedMusicProject,
    levelProperties.sharedBlocks,
    usingMusicProject,
  ]);

  const settings = useBlocklySettings();

  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      {!getIsShareView() && <AgeDialog turnOffFilter={turnOffFilter} />}
      {!aiGenerateMode && (
        <ResourcePanel
          isRunning={isRunning}
          hasRun={hasRun}
          hasEdited={hasEdited}
          levelProperties={levelProperties}
          headerClassName={moduleStyles.panelHeader}
          className={moduleStyles.instructionsArea}
          settings={settings}
        />
      )}
      <div className={moduleStyles.divider} />
      {!isToolboxMode && (
        <PanelContainer
          id="visualization"
          headerContent="Dance Party!"
          headerClassName={moduleStyles.panelHeader}
          className={classNames(
            moduleStyles.visualizationArea,
            aiGenerateMode && moduleStyles.jumbo
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
            {usingMusicProject &&
              (loadedMusicProject && metadataToUse ? (
                <MusicProjectBar title={metadataToUse.title} />
              ) : (
                // Temp UI
                'Loading your Music Lab project...'
              ))}
            <div
              id={DANCE_VISUALIZATION_ID}
              className={moduleStyles.visualization}
            >
              <div
                className={classNames(
                  moduleStyles.loading,
                  isLoading && moduleStyles.loadingShow
                )}
              >
                <img
                  src={loadingGif}
                  className={moduleStyles.loadingGif}
                  alt={danceI18n.dancePartyLoading()}
                />
              </div>
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
      {aiGenerateMode && (
        <Guide id="generate-panel" width="narrow">
          {
            <>
              <div>
                {generatedAiDance
                  ? "Let's dance!"
                  : "Now, let's generate a dance sequence to go with your song!"}
              </div>
              <Button
                ariaLabel={'Generate dance'}
                text={generatedAiDance ? 'Generate again!' : 'Generate dance'}
                type="primary"
                color="purple"
                size="s"
                iconLeft={{iconName: 'sparkles'}}
                onClick={generateAiDance}
              />
            </>
          }
        </Guide>
      )}
    </div>
  );
};

export default (props: LabProps<DanceLevelProperties, DanceProjectSources>) => (
  <SourcesContainer {...props} defaultSources={defaultSources}>
    {queryParams('ai-generate-dancer') === 'true' ||
    props.levelProperties.generateDancerMode ? (
      <GenerateDancer
        adlibOption={(queryParams('ai-generate-adlib') as string) || 'basic2'}
        levelProperties={props.levelProperties}
      />
    ) : (
      <DanceView levelProperties={props.levelProperties} />
    )}
  </SourcesContainer>
);
