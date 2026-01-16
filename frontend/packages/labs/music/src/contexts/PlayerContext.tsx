import * as Blockly from 'blockly/core';

import type {PropsWithChildren, MutableRefObject} from 'react';
import {createContext, useCallback, useRef, useEffect, useState} from 'react';

import MusicLibrary from '../player/MusicLibrary';
import MusicRegistry from '../MusicRegistry';
import Driver, {DriverEvent} from '../Driver';

export interface PlayerContent {
  /** A method to load the given library and establish it on the player */
  loadAndInitializePlayer: (libraryName: string) => Promise<void>;
  /** A reference to the currently loaded library, if loaded */
  library?: MusicLibrary;
  /** A possible reference to the blockly workspace */
  workspaceRef?: MutableRefObject<Blockly.Workspace | null>;
  /** A reference to the Driver */
  driverRef: MutableRefObject<Driver>;
  /** An upcall to be registered with the blockly workspace */
  onInject: (workspace: Blockly.WorkspaceSvg) => void;
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
  const onInject = useCallback(
    (workspace: Blockly.WorkspaceSvg) => {
      workspaceRef.current = workspace;
    },
    [workspaceRef],
  );

  const driver = useRef<Driver>(new Driver());

  useEffect(() => {
    // Set these in the registry as well
    MusicRegistry.player = driver.current.player;
    MusicRegistry.analyticsReporter = driver.current.analyticsReporter;

    driver.current.on(DriverEvent.LibraryUpdated, library => {
      setLibrary(library);
    });
  }, [setLibrary, driver]);

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
        onInject,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
