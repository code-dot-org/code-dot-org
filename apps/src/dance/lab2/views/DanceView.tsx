import {Button} from '@code-dot-org/component-library/button';
import {BlocklyOptions, Events, WorkspaceSvg} from 'blockly/core';
import classNames from 'classnames';
import {isEqual} from 'lodash';
import React, {useCallback, useEffect, useRef, useState} from 'react';

import {loadBlocksToWorkspace} from '@cdo/apps/blockly/addons/cdoUtils';
import {BLOCK_TYPES} from '@cdo/apps/blockly/constants';
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
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {registerReducers} from '@cdo/apps/redux';
import AgeDialog from '@cdo/apps/templates/AgeDialog';
import {commonI18n} from '@cdo/apps/types/locale';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';
import loadingGif from '@cdo/static/dance/DancePartyLoading.gif';

import danceI18n from '../locale';
import ProgramExecutor from '../ProgramExecutor';

import DanceControls from './DanceControls';
import SourcesContainer, {useSources} from './SourcesContainer';

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
    if (!programExecutor.current || !currentSongMetadata) {
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
    saveBlocks(true);
  }, [programExecutor, currentSongMetadata, saveBlocks, dispatch]);

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
      toolbox,
      readOnly: readonlyWorkspace,
      editBlocks: getAppOptionsEditBlocks(),
    } as BlocklyOptions);

    return () => workspace.current?.dispose();
  }, [dispatch, readonlyWorkspace, levelProperties]);

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
      {!isToolboxMode && (
        <PanelContainer
          id="visualization"
          headerContent="Dance Party!"
          headerClassName={moduleStyles.panelHeader}
          className={moduleStyles.visualizationArea}
        >
          <div className={moduleStyles.visualizationColumn}>
            {currentSources.selectedSong && (
              <SongSelector
                enableSongSelection={!isRunning}
                setSong={onSetSong}
                selectedSong={currentSources.selectedSong}
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
    </div>
  );
};

export default (props: LabProps<DanceLevelProperties, DanceProjectSources>) => (
  <SourcesContainer {...props} defaultSources={defaultSources}>
    <DanceView levelProperties={props.levelProperties} />
  </SourcesContainer>
);
