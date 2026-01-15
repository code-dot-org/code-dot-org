import type {FunctionComponent, PropsWithChildren} from 'react';
import {createContext, useCallback, useMemo, useEffect, useState} from 'react';

import {DEFAULT_BPM, DEFAULT_KEY} from '../constants';
import AppConfig from '../appConfig';
import AnalyticsReporter from '../LabMusicMetricsReporter';
import {KeyFromName} from '../utils/Notes';
import MusicPlayer from '../player/MusicPlayer';
import MusicLibrary from '../player/MusicLibrary';
import MusicRegistry from '../MusicRegistry';
import {KeyMapping} from '../utils/Notes';

export interface PlayerContent {
  /** A method to load the given library and establish it on the player */
  loadAndInitializePlayer: (libraryName: string) => Promise<void>;
  /** A reference to the currently loaded library, if loaded */
  library?: MusicLibrary;
  /** A reference to the currently initialized player */
  player: MusicPlayer;
}

const PlayerContext = createContext<PlayerContent>({
  loadAndInitializePlayer: async () => {},
  player: new MusicPlayer(),
});

//export const usePlayer = () => useContext(PlayerContext);

/**
 * This keeps track of the different components related to the music library
 * and playback.
 *
 * This generally takes the place of the old MusicView wrapper.
 */
export const PlayerProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const analyticsReporter = useMemo(() => new AnalyticsReporter(), []);
  const [library, setLibrary] = useState<MusicLibrary | undefined>(undefined);

  const player = useMemo(() => {
    const bpm = AppConfig.getValue('bpm');
    const key = AppConfig.getValue('key');
    return new MusicPlayer(
      parseInt(bpm || DEFAULT_BPM.toString()),
      KeyFromName[(key || KeyMapping[DEFAULT_KEY]).toUpperCase()],
      analyticsReporter,
    );
  }, [analyticsReporter]);

  useEffect(() => {
    // Set these in the registry as well
    MusicRegistry.player = player;
    MusicRegistry.analyticsReporter = analyticsReporter;
  }, [analyticsReporter, player]);

  const loadAndInitializePlayer = useCallback(
    async (libraryName: string) => {
      console.log('loading library', libraryName);
      const library = await MusicLibrary.loadLibrary(libraryName);
      setLibrary(library);
    },
    [setLibrary],
  );

  return (
    <PlayerContext.Provider
      value={{
        loadAndInitializePlayer,
        library,
        player,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export default PlayerContext;
