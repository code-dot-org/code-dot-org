import React, {useCallback, useContext, useEffect, useRef} from 'react';
import MusicValidator from '../progress/MusicValidator';
import moduleStyles from './music-view.module.scss';
import {
  InstructionsPositions,
  MusicState,
  setCurrentPlayheadPosition,
  showCallout,
} from '../redux/musicRedux';
import {TypedUseSelectorHook, useSelector} from 'react-redux';
import PanelContainer from '@cdo/apps/lab2/views/components/PanelContainer';
import musicI18n from '../locale';
import HeaderButtons from './HeaderButtons';
import AppConfig from '../appConfig';
import classNames from 'classnames';
import Instructions from '@cdo/apps/lab2/views/components/Instructions';
import {baseAssetUrl} from '../constants';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';
import Controls from './Controls';
import Timeline from './Timeline';
import {ProgressManagerContext} from '@cdo/apps/lab2/progress/ProgressContainer';
import {LabState} from '@cdo/apps/lab2/lab2Redux';

interface MusicLabViewProps {
  setPlaying: (playing: boolean) => void;
  playTrigger: (id: string) => void;
  hasTrigger: (id: string) => boolean;
  getCurrentPlayheadPosition: () => number;
  updateHighlightedBlocks: () => void;
  undo: () => void;
  redo: () => void;
  clearCode: () => void;
  validator: MusicValidator;
}

const useTypedSelector: TypedUseSelectorHook<{
  music: MusicState;
  lab: LabState;
}> = useSelector;

const UPDATE_RATE = 1000 / 30; // 30 times per second

const MusicLabView: React.FunctionComponent<MusicLabViewProps> = ({
  setPlaying,
  playTrigger,
  hasTrigger,
  getCurrentPlayheadPosition,
  updateHighlightedBlocks,
  undo,
  redo,
  clearCode,
  validator,
}) => {
  const dispatch = useAppDispatch();
  const showInstructions = useTypedSelector(
    state => state.music.showInstructions
  );
  const instructionsPosition = useTypedSelector(
    state => state.music.instructionsPosition
  );
  const timelineAtTop = useTypedSelector(state => state.music.timelineAtTop);
  const hideHeaders = useTypedSelector(state => state.music.hideHeaders);
  const appName = useTypedSelector(state => state.lab.levelProperties?.appName);
  const isPlaying = useTypedSelector(state => state.music.isPlaying);

  const progressManager = useContext(ProgressManagerContext);
  const intervalId = useRef<number | undefined>(undefined);

  // Pass music validator to Progress Manager
  useEffect(() => {
    if (progressManager && appName === 'music') {
      progressManager.setValidator(validator);
    }
  }, [progressManager, validator, appName]);

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

  // Starts updates whenever playback is in progress, and stops updates
  // when playback stops.
  useEffect(() => {
    if (isPlaying) {
      if (intervalId.current !== undefined) {
        window.clearInterval(intervalId.current);
      }
      // Reset validation before starting the update timer when playback starts.
      progressManager?.resetValidation();
      intervalId.current = window.setInterval(doPlaybackUpdate, UPDATE_RATE);
    } else {
      window.clearInterval(intervalId.current);
      intervalId.current = undefined;
    }
  }, [isPlaying, doPlaybackUpdate, progressManager]);

  const onInstructionsTextClick = useCallback(
    (id: string) => {
      dispatch(showCallout(id));
    },
    [dispatch]
  );

  const renderInstructions = useCallback(
    (position: keyof typeof InstructionsPositions) => {
      return (
        <div
          id="instructions-area"
          className={classNames(
            moduleStyles.instructionsArea,
            position === InstructionsPositions.TOP
              ? moduleStyles.instructionsTop
              : moduleStyles.instructionsSide
          )}
        >
          <PanelContainer
            id="instructions-panel"
            headerText={musicI18n.panelHeaderInstructions()}
            hideHeaders={hideHeaders}
          >
            <Instructions
              baseUrl={baseAssetUrl}
              layout={
                position !== InstructionsPositions.TOP
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
              headerText={musicI18n.panelHeaderControls()}
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

          <div id="timeline-area" className={moduleStyles.timelineArea}>
            <PanelContainer
              id="timeline-panel"
              headerText={musicI18n.panelHeaderTimeline()}
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

  return (
    <div id="music-lab" className={moduleStyles.musicLab}>
      {showInstructions &&
        instructionsPosition === InstructionsPositions.TOP &&
        renderInstructions(InstructionsPositions.TOP)}

      {timelineAtTop && renderPlayArea(true)}

      <div id="work-area" className={moduleStyles.workArea}>
        {showInstructions &&
          instructionsPosition === InstructionsPositions.LEFT &&
          renderInstructions(InstructionsPositions.LEFT)}

        <div id="blockly-area" className={moduleStyles.blocklyArea}>
          <PanelContainer
            id="workspace-panel"
            headerText={musicI18n.panelHeaderWorkspace()}
            hideHeaders={hideHeaders}
            rightHeaderContent={
              <HeaderButtons
                onClickUndo={undo}
                onClickRedo={redo}
                clearCode={clearCode}
              />
            }
          >
            <div id="blockly-div" />
          </PanelContainer>
        </div>

        {showInstructions &&
          instructionsPosition === InstructionsPositions.RIGHT &&
          renderInstructions(InstructionsPositions.RIGHT)}
      </div>

      {!timelineAtTop && renderPlayArea(false)}
    </div>
  );
};

export default MusicLabView;
