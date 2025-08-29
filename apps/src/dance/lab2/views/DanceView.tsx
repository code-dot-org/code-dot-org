import {Events, WorkspaceSvg} from 'blockly/core';
import classNames from 'classnames';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {loadBlocksToWorkspace} from '@cdo/apps/blockly/addons/cdoUtils';
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
import {getFilterStatus} from '@cdo/apps/dance/songs';
import SongSelector from '@cdo/apps/dance/SongSelector';
import {DanceLevelProperties, DanceProjectSources} from '@cdo/apps/dance/types';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import useLevelEditMode from '@cdo/apps/lab2/hooks/useLevelEditMode';
import {setPageError} from '@cdo/apps/lab2/lab2Redux';
import Lab2Registry from '@cdo/apps/lab2/Lab2Registry';
import {getIsShareView} from '@cdo/apps/lab2/projects/utils';
import {isReadOnlyWorkspace} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LabProps} from '@cdo/apps/lab2/types';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import loadingGif from '@cdo/static/dance/DancePartyLoading.gif';

import danceI18n from '../locale';
import ProgramExecutor from '../ProgramExecutor';
import getInitialSources from '../utils/getInitialSources';

import DanceControls from './DanceControls';

import moduleStyles from './dance-view.module.scss';

const DANCE_VISUALIZATION_ID = 'dance-visualization';
const BLOCKLY_DIV_ID = 'dance-blockly-div';

registerReducers(reducers);

/**
 * Renders the Lab2 version of Dance Lab. This separate container
 * allows us to support both Lab2 and legacy Dance.
 */
const DanceView: React.FunctionComponent<
  LabProps<DanceLevelProperties, DanceProjectSources>
> = ({levelProperties, initialSources}) => {
  const dispatch = useAppDispatch();

  const isRunning = useAppSelector(state => state.dance.isRunning);
  const userType = useAppSelector(state => state.currentUser.userType);
  const under13 = useAppSelector(state => state.currentUser.under13);
  const selectedSong = useAppSelector(state => state.dance.selectedSong);
  const songData = useAppSelector(state => state.dance.songData);
  const readonlyWorkspace = useAppSelector(isReadOnlyWorkspace);
  const currentSongMetadata = useAppSelector(
    state => state.dance.currentSongMetadata
  );
  const hasRun = useAppSelector(state => state.dance.hasRun);
  const hasEdited = useAppSelector(state => state.dance.hasEdited);
  const isLoading = useAppSelector(state => state.dance.isLoading);

  const programExecutor = useRef<ProgramExecutor | null>(null);
  const workspace = useRef<WorkspaceSvg | null>(null);

  const getSourcesToSave = (selectedSong: string) => {
    if (!workspace.current) {
      return;
    }
    const blocksJson = Blockly.serialization.workspaces.save(workspace.current);
    return {
      selectedSong,
      source: blocksJson,
    };
  };

  const WorkspaceAlert = useLevelEditMode(
    levelProperties.id,
    !!levelProperties.projectTemplateLevelName,
    useCallback(
      mode => {
        if (mode === 'toolbox') {
          // TODO: Support toolbox edit mode (get toolbox definition from workspace)
          return {};
        }
        if (!selectedSong) {
          return {};
        }
        const sourcesToSave = getSourcesToSave(selectedSong);
        if (sourcesToSave) {
          return {
            [mode === 'start' ? 'start_sources' : 'exemplar_sources']:
              sourcesToSave,
          };
        }
        return {};
      },
      [selectedSong]
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
      dispatch(setSong({songId, onAuthError}));
    },
    [dispatch]
  );

  const saveProject = useCallback((selectedSong: string, forceSave = false) => {
    const sourcesToSave = getSourcesToSave(selectedSong);
    if (sourcesToSave) {
      Lab2Registry.getInstance()
        .getProjectManager()
        ?.save(sourcesToSave, forceSave);
    }
  }, []);

  const runProgram = useCallback(async () => {
    if (!programExecutor.current || !currentSongMetadata || !selectedSong) {
      return;
    }

    // Set the runIsStartingFlag to true while the run function is executing,
    // and set the isRunning flag to true once the run actually starts.
    dispatch(setRunIsStarting(true));
    programExecutor.current.reset();
    await programExecutor.current.execute(
      Blockly.getWorkspaceCode(),
      currentSongMetadata
    );
    dispatch(setRunIsStarting(false));
    dispatch(setIsRunning(true));
    dispatch(setHasRun(true));
    saveProject(selectedSong, true);
  }, [
    programExecutor,
    currentSongMetadata,
    selectedSong,
    saveProject,
    dispatch,
  ]);

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
      if (e.type !== Events.BLOCK_DRAG && e.type !== Events.BLOCK_CHANGE) {
        return;
      }

      if (e.type === Events.BLOCK_DRAG && (e as Events.BlockDrag).isStart) {
        return;
      }

      if (!isRunning) {
        programExecutor.current?.staticPreview(Blockly.getWorkspaceCode());
      }
      if (selectedSong) {
        saveProject(selectedSong);
        dispatch(setHasEdited(true));
      }
    },
    [selectedSong, isRunning, dispatch, saveProject]
  );

  // Setup Blockly for dance party when first mounting.
  useEffect(setupBlocklyEnvironment, []);

  // Save project when selected song changes
  useEffect(() => {
    if (selectedSong) {
      saveProject(selectedSong);
    }
  }, [selectedSong, saveProject]);

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
    if (levelProperties.sharedBlocks) {
      installSharedBlocks(levelProperties.sharedBlocks);
    }
    workspace.current = Blockly.inject(blocklyDiv, {
      toolbox: levelProperties.toolboxBlocks,
      readOnly: readonlyWorkspace,
    });

    const sources =
      getInitialSources(levelProperties, initialSources) || defaultSources;
    loadBlocksToWorkspace(workspace.current, JSON.stringify(sources.source));

    return () => workspace.current?.dispose();
  }, [dispatch, initialSources, readonlyWorkspace, levelProperties]);

  // Set the initial song based on initial sources or level default
  useEffect(() => {
    const songKeys = Object.keys(songData);
    if (songKeys.length === 0) {
      // Song data has not been loaded yet.
      return;
    }
    const sources =
      getInitialSources(levelProperties, initialSources) ||
      (defaultSources as DanceProjectSources);
    const selectedSong = sources.selectedSong || levelProperties.defaultSong;
    const songToUse =
      selectedSong && songData[selectedSong] ? selectedSong : songKeys[0];
    dispatch(setSong({songId: songToUse, onAuthError}));
  }, [dispatch, initialSources, levelProperties, songData]);

  useEffect(() => {
    workspace.current?.addChangeListener(onBlockSpaceChange);
    return () => workspace.current?.removeChangeListener(onBlockSpaceChange);
  }, [onBlockSpaceChange]);

  // Set up the ProgramExecutor
  useEffect(() => {
    const {isProjectLevel, freePlay, customHelperLibrary, validationCode} =
      levelProperties;
    // record a replay log (and generate a video) for both project levels and any
    // course levels that have sharing enabled
    const recordReplayLog = isProjectLevel || freePlay || false;
    programExecutor.current = new ProgramExecutor(
      DANCE_VISUALIZATION_ID,
      onPuzzleComplete,
      readonlyWorkspace,
      recordReplayLog,
      Lab2Registry.getInstance().getMetricsReporter(),
      customHelperLibrary,
      validationCode,
      onEventsChanged
    );

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
  const settings = useBlocklySettings();

  return (
    <div id="dance-lab" className={moduleStyles.danceLab}>
      {!getIsShareView() && <AgeDialog turnOffFilter={turnOffFilter} />}
      <ResourcePanel
        isRunning={isRunning}
        hasRun={hasRun}
        hasEdited={hasEdited}
        levelProperties={levelProperties}
        headerClassName={moduleStyles.panelHeader}
        className={moduleStyles.instructionsArea}
        settings={settings}
      />
      <div className={moduleStyles.divider} />
      <PanelContainer
        id="visualization"
        headerContent="Dance Party!"
        headerClassName={moduleStyles.panelHeader}
        className={moduleStyles.visualizationArea}
      >
        <div className={moduleStyles.visualizationColumn}>
          {selectedSong && (
            <SongSelector
              enableSongSelection={!isRunning}
              setSong={onSetSong}
              selectedSong={selectedSong}
              songData={songData}
              filterOn={filterOn}
              levelIsRunning={isRunning}
            />
          )}
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
          <DanceControls onRun={runProgram} onReset={resetProgram} />
        </div>
      </PanelContainer>
      <div className={moduleStyles.divider} />
      <PanelContainer
        id="dance-workspace-panel"
        headerContent={commonI18n.workspaceHeaderShort()}
        className={moduleStyles.workspaceArea}
        headerClassName={moduleStyles.panelHeader}
      >
        {WorkspaceAlert}
        <div id={BLOCKLY_DIV_ID} />
      </PanelContainer>
    </div>
  );
};

export default DanceView;
