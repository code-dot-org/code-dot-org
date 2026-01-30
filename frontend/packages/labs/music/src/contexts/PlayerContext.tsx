import * as Blockly from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';

import type {PropsWithChildren, MutableRefObject} from 'react';
import {
  createContext,
  useMemo,
  useCallback,
  useRef,
  useEffect,
  useState,
} from 'react';

import MusicLibrary from '../player/MusicLibrary';
import MusicPlayer from '../player/MusicPlayer';
import MusicRegistry from '../MusicRegistry';
import Driver, {DriverEvent} from '../Driver';
import type {PlaybackExecutionData} from '../Driver';
import {musicActions} from '../redux';
import {useAppSelector, useAppDispatch} from '../redux/store';

export interface PlayerContent {
  /** A method to load the given library and establish it on the player */
  loadAndInitializePlayer: (libraryName: string) => Promise<void>;
  /** A reference to the currently loaded library, if loaded */
  library?: MusicLibrary;
  /** A reference to the MusicPlayer */
  player: MusicPlayer;
  /** A possible reference to the blockly workspace */
  workspaceRef?: MutableRefObject<Blockly.Workspace | null>;
  /** A possible reference to the JavaScript generator */
  javascriptGeneratorRef?: MutableRefObject<JavascriptGenerator | null>;
  /** A reference to the Driver */
  driver: Driver;
  /** An upcall to be registered with the Blockly workspace */
  onInject: (workspace: Blockly.WorkspaceSvg) => void;
  /** An upcall for Blockly events to be registered with the workspace */
  onChange: (event: Blockly.Events.Abstract) => void;
  /** Whether or not the workspace can have an event undone */
  canUndo: boolean;
  /** Whether or not the workspace can have an event redone */
  canRedo: boolean;
}

const PlayerContext = createContext<PlayerContent>(
  {} as unknown as PlayerContent,
);

/**
 * This keeps track of the different components related to the music library
 * and playback. Namely, this keeps a reference to a Driver class and facilitates
 * movement of state to and from that Driver.
 *
 * This plus the Driver class generally take the place of the old MusicView wrapper.
 */
export const PlayerProvider = ({children}: PropsWithChildren) => {
  const [library, setLibrary] = useState<MusicLibrary | undefined>(undefined);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const javascriptGeneratorRef = useRef<JavascriptGenerator | null>(null);

  const driver = useMemo(() => {
    return new Driver();
  }, []);

  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace;
      driver.setWorkspace(workspace);
      driver.setJavascriptGenerator(javascriptGeneratorRef.current!);
    },
    [driver, workspaceRef],
  );

  const dispatch = useAppDispatch();

  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const selectedBlockId = useAppSelector(state => state.music.selectedBlockId);
  const onSelected = useCallback(
    (blockId?: string) => {
      if (!driver.getIsPlaying()) {
        dispatch(musicActions.selectBlockId(blockId));
      }
    },
    [driver, dispatch],
  );

  const playheadPosition = useAppSelector(
    state => state.music.startingPlayheadPosition,
  );
  useEffect(
    () => driver.setStartingPlayheadPosition(playheadPosition),
    [driver, playheadPosition],
  );

  // Handle when an outsider sets the current block
  useEffect(() => {
    if (selectedBlockId) {
      driver.selectBlock(selectedBlockId);
    } else {
      driver.clearSelection();
    }
  }, [driver, selectedBlockId]);

  // Handle blockly events
  const onChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      driver.onBlockEvent(event);

      // Update undo status when blocks change.
      setCanUndo(driver.canUndo());
      setCanRedo(driver.canRedo());

      // Also update in redux
      dispatch(
        musicActions.setUndoStatus({
          canUndo: driver.canUndo(),
          canRedo: driver.canRedo(),
        }),
      );
    },
    [dispatch, driver, setCanUndo, setCanRedo],
  );

  useEffect(() => {
    // Set these in the registry as well
    MusicRegistry.player = driver.player;
    MusicRegistry.analyticsReporter = driver.analyticsReporter;

    // Attach an event when the library is updated
    const libraryHandler = (library: MusicLibrary) => {
      setLibrary(library);
    };
    driver.addListener(DriverEvent.LibraryUpdated, libraryHandler);

    // Attach an event when a trigger is selected
    const setTriggerHandler = (triggerId: string) =>
      dispatch(musicActions.setSelectedTriggerId(triggerId));
    driver.addListener(DriverEvent.SetTrigger, setTriggerHandler);

    // Attach an event when a block is selected
    driver.addListener(DriverEvent.Selected, onSelected);

    // Attach an event when playback starts or stops
    const onPlay = () => dispatch(musicActions.setIsPlaying(true));
    const onStop = () => dispatch(musicActions.setIsPlaying(false));
    driver.addListener(DriverEvent.PlaybackStarted, onPlay);
    driver.addListener(DriverEvent.PlaybackStopped, onStop);

    const onUpdate = () => {
      dispatch(
        musicActions.setCurrentPlayheadPosition(
          driver.getCurrentPlayheadPosition(),
        ),
      );
      // TODO
      //updateHighlightedBlocks();
      //progressManager?.updateProgress();
    };
    driver.addListener(DriverEvent.Tick, onUpdate);

    // Attach an event when the timeline should be cleared
    const clearTimelineHandler = () => {
      dispatch(musicActions.clearPlaybackEvents());
      dispatch(musicActions.clearOrderedFunctions());
    };
    driver.addListener(DriverEvent.ClearTimeline, clearTimelineHandler);

    // Attach an event when the timeline should be updated
    const updateTimelineHandler = (data: PlaybackExecutionData) => {
      console.table({
        events: data.playbackEvents.length,
        functions: data.orderedFunctions.length,
        lastMeasure: data.lastMeasure,
      });
      dispatch(musicActions.addPlaybackEvents(data.playbackEvents));
      dispatch(musicActions.addOrderedFunctions(data.orderedFunctions));
      dispatch(musicActions.setLastMeasure(data.lastMeasure));
    };
    driver.addListener(DriverEvent.UpdateTimeline, updateTimelineHandler);
    const onUpdatePosition = (position: number) =>
      dispatch(musicActions.setCurrentPlayheadPosition(position));
    driver.addListener(DriverEvent.UpdatePosition, onUpdatePosition);

    return () => {
      driver.removeListener(DriverEvent.LibraryUpdated, libraryHandler);
      driver.removeListener(DriverEvent.SetTrigger, setTriggerHandler);
      driver.removeListener(DriverEvent.Selected, onSelected);
      driver.removeListener(DriverEvent.PlaybackStarted, onPlay);
      driver.removeListener(DriverEvent.PlaybackStopped, onStop);
      driver.removeListener(DriverEvent.Tick, onUpdate);
      driver.removeListener(DriverEvent.ClearTimeline, clearTimelineHandler);
      driver.removeListener(DriverEvent.UpdateTimeline, updateTimelineHandler);
      driver.removeListener(DriverEvent.UpdatePosition, onUpdatePosition);
    };
  }, [driver, selectedBlockId, setLibrary, dispatch, onSelected]);

  const loadAndInitializePlayer = useCallback(
    async (libraryName: string) => {
      driver.loadAndInitializePlayer(libraryName);
    },
    [driver],
  );

  return (
    <PlayerContext.Provider
      value={{
        loadAndInitializePlayer,
        library,
        player: driver.player,
        driver,
        workspaceRef,
        javascriptGeneratorRef,
        onInject,
        onChange,
        canUndo,
        canRedo,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
