import {createContext, useContext} from 'react';

// Provides the music project channel ID to sublevels in the Music Dance AI experience.
export const MusicProjectContext = createContext<string | undefined>(undefined);

export const useMusicProject = () => useContext(MusicProjectContext);
