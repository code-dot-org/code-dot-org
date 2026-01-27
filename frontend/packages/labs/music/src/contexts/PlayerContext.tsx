import * as Blockly from 'blockly/core';
import type {JavascriptGenerator} from 'blockly/javascript';

import type {PropsWithChildren, MutableRefObject} from 'react';
import {createContext, useCallback, useRef, useEffect, useState} from 'react';

import MusicLibrary from '../player/MusicLibrary';
import MusicRegistry from '../MusicRegistry';
import Driver, {DriverEvent} from '../Driver';
import {musicActions} from '../redux';
import {useAppDispatch} from '../redux/store';

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

  const onChange = useCallback((event: Blockly.Events.Abstract) => {
    if (driver.current) {
      driver.current.onBlockEvent(event);

      // Update undo status when blocks change.
      setCanUndo(driver.current.canUndo());
      setCanRedo(driver.current.canRedo());
    }
  }, [driver, setCanUndo, setCanRedo]);

  useEffect(() => {
    // Set these in the registry as well
    MusicRegistry.player = driver.current.player;
    MusicRegistry.analyticsReporter = driver.current.analyticsReporter;

    // Attach an event when the library is updated
    driver.current.on(DriverEvent.LibraryUpdated, library => {
      setLibrary(library);
    });

    // Attach an event when a trigger is selected
    driver.current.on(DriverEvent.SetTrigger, triggerId => (
      dispatch(musicActions.setSelectedTriggerId(triggerId))
    ));

    // Attach an event when a block is selected
    driver.current.on(DriverEvent.Selected, blockId => {
      if (!driver.current.getIsPlaying()) {
        dispatch(musicActions.selectBlockId(blockId));
      }
    });
  }, [setLibrary, driver, dispatch]);

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
