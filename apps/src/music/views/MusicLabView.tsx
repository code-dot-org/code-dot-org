import {javascript} from '@codemirror/lang-javascript';
import classNames from 'classnames';
import React, {memo, useCallback, useContext, useEffect} from 'react';
import {useSelector} from 'react-redux';

import {WorkspaceSerialization} from '@cdo/apps/blockly/types';
import {applyBlockIdOverrides} from '@cdo/apps/blockly/utils';
import header from '@cdo/apps/code-studio/header';
import {
  START_SOURCES,
  TOOLBOX_BLOCKS,
  WARNING_BANNER_MESSAGES,
} from '@cdo/apps/lab2/constants';
import {useBlocklySettings} from '@cdo/apps/lab2/hooks/useBlocklySettings';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {
  getAppOptionsEditBlocks,
  getAppOptionsEditingExemplar,
  getAppOptionsViewingExemplar,
} from '@cdo/apps/lab2/projects/utils';
import {isProjectTemplateLevel} from '@cdo/apps/lab2/redux/lab2ReduxSelectors';
import {LevelProperties} from '@cdo/apps/lab2/types';
import CodeEditor from '@cdo/apps/lab2/views/components/editor/CodeEditor';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import InstructionsV2 from '@cdo/apps/lab2/views/components/Instructions/InstructionsV2';
import ResourcePanel from '@cdo/apps/lab2/views/components/Instructions/ResourcePanel';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {DialogType, useDialogControl} from '@cdo/apps/lab2/views/dialogs';
import ProjectTemplateWorkspaceIconV2 from '@cdo/apps/templates/ProjectTemplateWorkspaceIconV2';
import experiments from '@cdo/apps/util/experiments';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import AnalyticsReporter from '../analytics/AnalyticsReporter';
import AppConfig from '../appConfig';
import {installFunctionBlocks} from '../blockly/blockUtils';
import MusicBlocklyWorkspace from '../blockly/MusicBlocklyWorkspace';
import {Trigger} from '../constants';
import musicI18n from '../locale';
import {PlaybackEvent} from '../player/interfaces/PlaybackEvent';
import MusicPlayer from '../player/MusicPlayer';
import MusicValidator from '../progress/MusicValidator';
import {
  getBlockMode,
  InstructionsPosition,
  setCurrentPlayheadPosition,
  setShowInstructions,
  showCallout,
} from '../redux/musicRedux';
import {MusicExemplarSettings, MusicLevelData} from '../types';

import AdvancedControls from './AdvancedControls';
import Controls from './Controls';
import ExemplarPlayerView from './ExemplarPlayerView';
import Generate from './Generate';
import HeaderButtons from './HeaderButtons';
import usePlaybackUpdate from './hooks/usePlaybackUpdate';
import useUpdateAnalytics from './hooks/useUpdateAnalytics';
import useUpdatePlayer from './hooks/useUpdatePlayer';
import MusicPlayView from './MusicPlayView';
import PackDialog from './PackDialog';
import Timeline from './Timeline';

import moduleStyles from './music-view.module.scss';

const exemplarPlayerInsideInstructions =
  AppConfig.getValue('exemplar-player-bottom') !== 'true';

interface MusicLabViewProps {
  blocklyDivId: string;
  setPlaying: (playing: boolean) => void;
  playTrigger: (id: string) => void;
  triggers: Trigger[];
  getCurrentPlayheadPosition: () => number;
  updateHighlightedBlocks: () => void;
  undo: () => void;
  redo: () => void;
  clearCode: () => void;
  validator: MusicValidator;
  player: MusicPlayer;
  allowPackSelection: boolean;
  analyticsReporter: AnalyticsReporter;
  blocklyWorkspace: MusicBlocklyWorkspace;
  exemplarPlaybackEvents: PlaybackEvent[];
  executeCode: (code: string) => void;
  hasRun: boolean;
  hasEdited: boolean;
  levelProperties: LevelProperties;
}

const MusicLabView: React.FunctionComponent<MusicLabViewProps> = ({
  blocklyDivId,
  setPlaying,
  playTrigger,
  triggers,
  getCurrentPlayheadPosition,
  updateHighlightedBlocks,
  undo,
  redo,
  clearCode,
  validator,
  player,
  allowPackSelection,
  analyticsReporter,
  blocklyWorkspace,
  exemplarPlaybackEvents,
  executeCode,
  hasRun,
  hasEdited,
  levelProperties,
}) => {
  const dialogControl = useDialogControl();
  useUpdatePlayer(player);
  useUpdateAnalytics(
    analyticsReporter,
    levelProperties.isProjectLevel || false
  );
  const dispatch = useAppDispatch();
  const isPlaying = useAppSelector(state => state.music.isPlaying);
  const showInstructions = useAppSelector(
    state => state.music.showInstructions
  );
  const instructionsPosition = useAppSelector(
    state => state.music.instructionsPosition
  );
  const timelineAtTop = useAppSelector(state => state.music.timelineAtTop);
  const hideHeaders = useAppSelector(state => state.music.hideHeaders);
  const {
    id: levelId,
    appName,
    skipUrl,
    levelData,
    exemplarSources,
  } = levelProperties;
  const exemplarSettings = levelProperties.exemplarSettings as
    | MusicExemplarSettings
    | undefined;
  const isPlayView = useAppSelector(state => state.lab.isShareView);
  const validationStateCallout = useAppSelector(
    state => state.lab.validationState.callout
  );

  const progressManager = useContext(ProgressManagerContext);

  const isStartMode = getAppOptionsEditBlocks() === START_SOURCES;
  const isToolboxMode = getAppOptionsEditBlocks() === TOOLBOX_BLOCKS;
  const isEditingExemplar = getAppOptionsEditingExemplar();
  const isViewingExemplar = getAppOptionsViewingExemplar();
  const projectTemplateLevel = useAppSelector(isProjectTemplateLevel);
  const blockMode = useSelector(getBlockMode);
  const useNewInstructions = experiments.isEnabled(
    experiments.LAB2_INSTRUCTIONS_V2
  );

  // Pass music validator to Progress Manager
  useEffect(() => {
    if (progressManager && appName === 'music') {
      progressManager.setValidator(validator);
    }
  }, [progressManager, validator, appName]);

  useEffect(() => {
    dispatch(setShowInstructions(!!levelProperties.longInstructions));
  }, [dispatch, levelProperties.longInstructions]);

  useEffect(() => {
    if (isStartMode) {
      header.showLevelBuilderSaveButton(() => {
        const workspaceSerialization = blocklyWorkspace.getCode();
        if (Blockly.blockIdOverrides) {
          applyBlockIdOverrides(
            workspaceSerialization as WorkspaceSerialization,
            Blockly.blockIdOverrides
          );
        }
        const updatedLevelData = {
          ...levelData,
          startSources: workspaceSerialization,
        };
        return {level_data: updatedLevelData};
      });
    } else if (isEditingExemplar) {
      header.showLevelBuilderSaveButton(
        () => ({exemplar_sources: blocklyWorkspace.getCode()}),
        'Levelbuilder: Edit Exemplar',
        `/levels/${levelId}/update_exemplar_code`
      );
    } else if (isToolboxMode) {
      header.showLevelBuilderSaveButton(() => {
        const updatedLevelData = {
          ...levelData,
          toolboxDefinition: blocklyWorkspace.workspaceToToolboxDefinition(),
        };
        return {level_data: updatedLevelData};
      }, 'Levelbuilder: Edit toolbox blocks');
    }
  }, [
    blocklyWorkspace,
    isStartMode,
    isEditingExemplar,
    isToolboxMode,
    levelData,
    levelId,
  ]);

  // Use the Lab2 generic prompt for Blockly prompt dialogs.
  const showGenericPrompt = useCallback(
    (
      message: string,
      value: string,
      handleConfirm: (input: string | null) => void
    ) => {
      dialogControl.showDialog({
        type: DialogType.GenericPrompt,
        message,
        value,
        handleConfirm,
      });
    },
    [dialogControl]
  );
  const showGenericAlert = useCallback(
    (message: string) => {
      dialogControl.showDialog({type: DialogType.GenericAlert, message});
    },
    [dialogControl]
  );
  Blockly.dialog.setPrompt(showGenericPrompt);
  Blockly.dialog.setAlert(showGenericAlert);

  useEffect(() => {
    installFunctionBlocks(blockMode);
  }, [blockMode]);

  // Update loop that runs while playback is in progress.
  const doPlaybackUpdate = useCallback(() => {
    dispatch(setCurrentPlayheadPosition(getCurrentPlayheadPosition()));
    updateHighlightedBlocks();
    progressManager?.updateProgress();
  }, [
    dispatch,
    getCurrentPlayheadPosition,
    updateHighlightedBlocks,
    progressManager,
  ]);

  const playheadPastEnd = useAppSelector(state => {
    const {startingPlayheadPosition, lastMeasure, currentPlayheadPosition} =
      state.music;
    // We are done playing once the playhead reaches the end of the last scheduled sound.
    // But if the starting playhead position has been set beyond that point, we'll use that
    // instead, so that at least a bit of playback can be shown.
    const stopMeasure = Math.max(startingPlayheadPosition, lastMeasure);

    // Show a little extra playback.  If there are any triggers, then play for longer in case
    // the user wants to trigger another sound.
    const extraMeasures = blocklyWorkspace.hasAnyTriggers() ? 4 : 2;

    return currentPlayheadPosition >= stopMeasure + extraMeasures;
  });

  // Stop the song if the playhead is past the desired end.
  useEffect(() => {
    if (!isPlaying) {
      return;
    }

    if (playheadPastEnd) {
      setPlaying(false);
    }
  }, [isPlaying, setPlaying, playheadPastEnd]);

  const resetValidation = useCallback(
    () => progressManager?.resetValidation(),
    [progressManager]
  );
  usePlaybackUpdate(doPlaybackUpdate, resetValidation);

  const onInstructionsTextClick = useCallback(
    (id: string) => {
      dispatch(showCallout(id));
    },
    [dispatch]
  );

  useEffect(() => {
    if (validationStateCallout) {
      dispatch(showCallout(validationStateCallout));
    }
  }, [dispatch, validationStateCallout]);

  const hideChaff = useCallback(
    () => blocklyWorkspace.hideChaff(),
    [blocklyWorkspace]
  );

  const showExemplarPlayer =
    exemplarSettings?.playerEnabled && exemplarSources && !isEditingExemplar;

  const showAdvancedControls =
    AppConfig.getValue('player') === 'tonejs' &&
    AppConfig.getValue('advanced-controls-enabled') === 'true';

  const settings = useBlocklySettings();

  if (isPlayView) {
    return <MusicPlayView setPlaying={setPlaying} />;
  }

  const headerContent = (
    <div className={moduleStyles.centerHeaderContent}>
      <div className={moduleStyles.centerHeaderContentText}>
        {musicI18n.panelHeaderWorkspace()}
      </div>
      {projectTemplateLevel && <ProjectTemplateWorkspaceIconV2 />}
    </div>
  );

  return (
    <div
      id="music-lab"
      className={classNames(
        moduleStyles.musicLab,
        timelineAtTop && moduleStyles.reverse
      )}
    >
      {allowPackSelection && <PackDialog player={player} />}
      <div
        id="work-area"
        className={classNames(moduleStyles.workArea, {
          // Allow full height when the play area is hidden.
          [moduleStyles.toolboxMode]: isToolboxMode,
          [moduleStyles.reverse]:
            instructionsPosition === InstructionsPosition.RIGHT,
        })}
      >
        {showInstructions && (
          <div
            id="instructions-area"
            className={classNames(
              moduleStyles.instructionsArea,
              moduleStyles.instructionsSide
            )}
          >
            {experiments.isEnabledAllowingQueryString(
              experiments.LAB2_RESOURCE_PANEL
            ) ? (
              <ResourcePanel
                isRunning={isPlaying}
                handleInstructionsTextClick={onInstructionsTextClick}
                bottomComponent={
                  exemplarPlayerInsideInstructions &&
                  showExemplarPlayer && (
                    <ExemplarPlayerView
                      playbackEvents={exemplarPlaybackEvents}
                      title={exemplarSettings.playerTitle!}
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
              />
            ) : (
              <PanelContainer
                id="instructions-panel"
                headerContent={musicI18n.panelHeaderInstructions()}
                hideHeaders={hideHeaders}
                headerClassName={moduleStyles.panelContainerHeader}
              >
                {useNewInstructions ? (
                  <InstructionsV2
                    isRunning={isPlaying}
                    handleInstructionsTextClick={onInstructionsTextClick}
                    bottomComponent={
                      exemplarPlayerInsideInstructions &&
                      showExemplarPlayer && (
                        <ExemplarPlayerView
                          playbackEvents={exemplarPlaybackEvents}
                          title={exemplarSettings.playerTitle!}
                          player={player}
                          insideInstructions={exemplarPlayerInsideInstructions}
                        />
                      )
                    }
                    hasRun={hasRun}
                    hasEdited={hasEdited}
                    fixedDarkBackground={true}
                    overrideTheme={'Light'}
                    levelProperties={levelProperties}
                  />
                ) : (
                  <Instructions
                    isRunning={isPlaying}
                    handleInstructionsTextClick={onInstructionsTextClick}
                    bottomComponent={
                      exemplarPlayerInsideInstructions &&
                      showExemplarPlayer && (
                        <ExemplarPlayerView
                          playbackEvents={exemplarPlaybackEvents}
                          title={exemplarSettings.playerTitle!}
                          player={player}
                          insideInstructions={exemplarPlayerInsideInstructions}
                        />
                      )
                    }
                    hasRun={hasRun}
                    hasEdited={hasEdited}
                  />
                )}
                {!exemplarPlayerInsideInstructions && showExemplarPlayer && (
                  <ExemplarPlayerView
                    playbackEvents={exemplarPlaybackEvents}
                    title={exemplarSettings.playerTitle!}
                    player={player}
                    insideInstructions={exemplarPlayerInsideInstructions}
                  />
                )}
              </PanelContainer>
            )}
          </div>
        )}

        <div id="blockly-area" className={moduleStyles.blocklyArea}>
          {AppConfig.getValue('ai-generate') === 'true' && <Generate />}

          <PanelContainer
            id="workspace-panel"
            headerContent={headerContent}
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
            headerClassName={
              experiments.isEnabledAllowingQueryString(
                experiments.LAB2_RESOURCE_PANEL
              )
                ? moduleStyles.headerWithBorder
                : moduleStyles.panelContainerHeader
            }
          >
            {isStartMode && (
              <div
                id="startSourcesWarningBanner"
                className={moduleStyles.warningBanner}
              >
                {projectTemplateLevel
                  ? WARNING_BANNER_MESSAGES.TEMPLATE
                  : WARNING_BANNER_MESSAGES.STANDARD}
              </div>
            )}
            {isEditingExemplar && (
              <div
                id="toolboxModeWarningBanner"
                className={moduleStyles.warningBanner}
              >
                {WARNING_BANNER_MESSAGES.EXEMPLAR_MODE}
              </div>
            )}
            {isViewingExemplar && (
              <div
                id="toolboxModeWarningBanner"
                className={moduleStyles.warningBanner}
              >
                {WARNING_BANNER_MESSAGES.VIEWING_EXEMPLAR}
              </div>
            )}
            {isToolboxMode && (
              <div
                id="toolboxModeWarningBanner"
                className={moduleStyles.warningBanner}
              >
                {WARNING_BANNER_MESSAGES.TOOLBOX_MODE}
              </div>
            )}
            {AppConfig.getValue('js-editor') === 'true' && (
              <CodeEditor
                onCodeChange={executeCode}
                startCode={''}
                editorConfigExtensions={[javascript()]}
                appName="music"
              />
            )}
            <div role="application" id={blocklyDivId} />
            {showAdvancedControls && (
              <div className={moduleStyles.advancedControlsContainer}>
                <AdvancedControls />
              </div>
            )}
          </PanelContainer>
        </div>
      </div>

      {!isToolboxMode && (
        <div id="play-area" className={classNames(moduleStyles.playArea)}>
          <div id="controls-area" className={moduleStyles.controlsArea}>
            <PanelContainer
              id="controls-panel"
              headerContent={musicI18n.panelHeaderControls()}
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
          </div>

          <div
            dir="ltr"
            id="timeline-area"
            className={moduleStyles.timelineArea}
          >
            <PanelContainer
              id="timeline-panel"
              headerContent={musicI18n.panelHeaderTimeline()}
              hideHeaders={hideHeaders}
            >
              <Timeline
                allowChangeStartingPlayheadPosition={
                  (levelProperties.levelData as MusicLevelData | undefined)
                    ?.allowChangeStartingPlayheadPosition
                }
                isPredictLevel={levelProperties.predictSettings?.isPredictLevel}
              />
            </PanelContainer>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(MusicLabView);
