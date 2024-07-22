import classNames from 'classnames';
import React, {useCallback, useContext, useEffect} from 'react';

import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import {useAppDispatch, useAppSelector} from '@cdo/apps/util/reduxHooks';

import AppConfig, {getBaseAssetUrl} from '../appConfig';
import musicI18n from '../locale';
import MusicPlayer from '../player/MusicPlayer';
import MusicValidator from '../progress/MusicValidator';
import {
  InstructionsPosition,
  setCurrentPlayheadPosition,
  showCallout,
} from '../redux/musicRedux';

import AdvancedControls from './AdvancedControls';
import Controls from './Controls';
import HeaderButtons from './HeaderButtons';
import usePlaybackUpdate from './hooks/usePlaybackUpdate';
import useUpdatePlayer from './hooks/useUpdatePlayer';
import MusicPlayView from './MusicPlayView';
import PackDialog from './PackDialog';
import Timeline from './Timeline';

import moduleStyles from './music-view.module.scss';

interface MusicLabViewProps {
  blocklyDivId: string;
  setPlaying: (playing: boolean) => void;
  playTrigger: (id: string) => void;
  hasTrigger: (id: string) => boolean;
  getCurrentPlayheadPosition: () => number;
  updateHighlightedBlocks: () => void;
  undo: () => void;
  redo: () => void;
  clearCode: () => void;
  validator: MusicValidator;
  player: MusicPlayer;
  allowPackSelection: boolean;
}

const MusicLabView: React.FunctionComponent<MusicLabViewProps> = ({
  blocklyDivId,
  setPlaying,
  playTrigger,
  hasTrigger,
  getCurrentPlayheadPosition,
  updateHighlightedBlocks,
  undo,
  redo,
  clearCode,
  validator,
  player,
  allowPackSelection,
}) => {
  useUpdatePlayer(player);
  const dispatch = useAppDispatch();
  const showInstructions = useAppSelector(
    state => state.music.showInstructions
  );
  const instructionsPosition = useAppSelector(
    state => state.music.instructionsPosition
  );
  const timelineAtTop = useAppSelector(state => state.music.timelineAtTop);
  const hideHeaders = useAppSelector(state => state.music.hideHeaders);
  const appName = useAppSelector(state => state.lab.levelProperties?.appName);
  const skipUrl = useAppSelector(state => state.lab.levelProperties?.skipUrl);
  const isPlayView = useAppSelector(state => state.lab.isShareView);

  const progressManager = useContext(ProgressManagerContext);

  // Pass music validator to Progress Manager
  useEffect(() => {
    if (progressManager && appName === 'music') {
      progressManager.setValidator(validator);
    }
  }, [progressManager, validator, appName]);

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

  const renderInstructions = useCallback(
    (position: InstructionsPosition) => {
      return (
        <div
          id="instructions-area"
          className={classNames(
            moduleStyles.instructionsArea,
            position === InstructionsPosition.TOP
              ? moduleStyles.instructionsTop
              : moduleStyles.instructionsSide
          )}
        >
          <PanelContainer
            id="instructions-panel"
            headerContent={musicI18n.panelHeaderInstructions()}
            hideHeaders={hideHeaders}
          >
            <Instructions
              baseUrl={getBaseAssetUrl() || ''}
              layout={
                position !== InstructionsPosition.TOP
                  ? 'vertical'
                  : 'horizontal'
              }
              handleInstructionsTextClick={onInstructionsTextClick}
            />
          </PanelContainer>
        </div>
      );
    },
    [hideHeaders, onInstructionsTextClick]
  );

  const renderPlayArea = useCallback(
    (timelineAtTop: boolean) => {
      return (
        <div
          id="play-area"
          className={classNames(
            moduleStyles.playArea,
            timelineAtTop
              ? moduleStyles.playAreaTop
              : moduleStyles.playAreaBottom
          )}
        >
          <div id="controls-area" className={moduleStyles.controlsArea}>
            <PanelContainer
              id="controls-panel"
              headerContent={musicI18n.panelHeaderControls()}
              hideHeaders={hideHeaders}
            >
              <Controls
                setPlaying={setPlaying}
                playTrigger={playTrigger}
                hasTrigger={hasTrigger}
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
              <Timeline />
            </PanelContainer>
          </div>
        </div>
      );
    },
    [setPlaying, playTrigger, hasTrigger, hideHeaders]
  );

  const showAdvancedControls =
    AppConfig.getValue('player') === 'tonejs' &&
    AppConfig.getValue('advanced-controls-enabled') === 'true';

  if (isPlayView) {
    return <MusicPlayView setPlaying={setPlaying} />;
  }

  return (
    <div id="music-lab" className={moduleStyles.musicLab}>
      {allowPackSelection && <PackDialog player={player} />}

      {showInstructions &&
        instructionsPosition === InstructionsPosition.TOP &&
        renderInstructions(InstructionsPosition.TOP)}

      {timelineAtTop && renderPlayArea(true)}

      <div id="work-area" className={moduleStyles.workArea}>
        {showInstructions &&
          instructionsPosition === InstructionsPosition.LEFT &&
          renderInstructions(InstructionsPosition.LEFT)}

        <div id="blockly-area" className={moduleStyles.blocklyArea}>
          <PanelContainer
            id="workspace-panel"
            headerContent={musicI18n.panelHeaderWorkspace()}
            hideHeaders={hideHeaders}
            rightHeaderContent={
              <HeaderButtons
                onClickUndo={undo}
                onClickRedo={redo}
                clearCode={clearCode}
                allowPackSelection={allowPackSelection}
                skipUrl={skipUrl}
              />
            }
          >
            <div id={blocklyDivId} />
            {showAdvancedControls && (
              <div className={moduleStyles.advancedControlsContainer}>
                <AdvancedControls />
              </div>
            )}
          </PanelContainer>
        </div>

        {showInstructions &&
          instructionsPosition === InstructionsPosition.RIGHT &&
          renderInstructions(InstructionsPosition.RIGHT)}
      </div>

      {!timelineAtTop && renderPlayArea(false)}
    </div>
  );
};

export default MusicLabView;
