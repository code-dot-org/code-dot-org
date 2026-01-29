import * as Blockly from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';

import type {PropsWithChildren, MutableRefObject} from 'react';
import {createContext, useCallback, useRef, useEffect, useState} from 'react';

import MusicLibrary from '../player/MusicLibrary';
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
  /** A possible reference to the blockly workspace */
  workspaceRef?: MutableRefObject<Blockly.Workspace | null>;
  /** A possible reference to the JavaScript generator */
  javascriptGeneratorRef?: MutableRefObject<JavascriptGenerator | null>;
  /** A reference to the Driver */
  driverRef: MutableRefObject<Driver>;
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
  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace;
      driver.current.setWorkspace(workspace);
      driver.current.setJavascriptGenerator(javascriptGeneratorRef.current!);
    },
    [workspaceRef],
  );

  const driver = useRef<Driver>(new Driver());
  const dispatch = useAppDispatch();

  const [canUndo, setCanUndo] = useState<boolean>(false);
  const [canRedo, setCanRedo] = useState<boolean>(false);

  const selectedBlockId = useAppSelector(state => state.music.selectedBlockId);
  const onSelected = useCallback(
    (blockId?: string) => {
      console.log('Selected!', blockId);
      if (!driver.current.getIsPlaying()) {
        console.log('dispatched');
        dispatch(musicActions.selectBlockId(blockId));
      }
    },
    [dispatch],
  );

  useEffect(() => {
    if (selectedBlockId) {
      driver.current.selectBlock(selectedBlockId);
    } else {
      driver.current.clearSelection();
    }
  }, [selectedBlockId]);

  const onChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      if (driver.current) {
        driver.current.onBlockEvent(event);

        // Update undo status when blocks change.
        setCanUndo(driver.current.canUndo());
        setCanRedo(driver.current.canRedo());

        // Also update in redux
        dispatch(
          musicActions.setUndoStatus({
            canUndo: driver.current.canUndo(),
            canRedo: driver.current.canRedo(),
          }),
        );
      }
    },
    [dispatch, driver, setCanUndo, setCanRedo],
  );

  useEffect(() => {
    const currentDriver = driver.current;

    // Set these in the registry as well
    MusicRegistry.player = currentDriver.player;
    MusicRegistry.analyticsReporter = currentDriver.analyticsReporter;

    const libraryHandler = (library: MusicLibrary) => {
      setLibrary(library);
    };
    // Attach an event when the library is updated
    currentDriver.addListener(DriverEvent.LibraryUpdated, libraryHandler);

    // Attach an event when a trigger is selected
    const setTriggerHandler = (triggerId: string) =>
      dispatch(musicActions.setSelectedTriggerId(triggerId));
    currentDriver.addListener(DriverEvent.SetTrigger, setTriggerHandler);

    // Attach an event when a block is selected
    console.log('attaching --------------');
    currentDriver.addListener(DriverEvent.Selected, onSelected);

    // Attach an event when the timeline should be cleared
    const clearTimelineHandler = () => {
      dispatch(musicActions.clearPlaybackEvents());
      dispatch(musicActions.clearOrderedFunctions());
    };
    currentDriver.addListener(DriverEvent.ClearTimeline, clearTimelineHandler);

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
    currentDriver.addListener(
      DriverEvent.UpdateTimeline,
      updateTimelineHandler,
    );

    return () => {
      currentDriver.removeListener(DriverEvent.LibraryUpdated, libraryHandler);
      currentDriver.removeListener(DriverEvent.SetTrigger, setTriggerHandler);
      currentDriver.removeListener(DriverEvent.Selected, onSelected);
      currentDriver.removeListener(
        DriverEvent.ClearTimeline,
        clearTimelineHandler,
      );
      currentDriver.removeListener(
        DriverEvent.UpdateTimeline,
        updateTimelineHandler,
      );
    };
  }, [selectedBlockId, setLibrary, driver, dispatch, onSelected]);

  const loadAndInitializePlayer = useCallback(async (libraryName: string) => {
    driver.current.loadAndInitializePlayer(libraryName);
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        loadAndInitializePlayer,
        library,
        driverRef: driver,
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
