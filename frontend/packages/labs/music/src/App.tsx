import {useApiClient} from '@code-dot-org/core/api';
import type {BlocklyLabProps} from '@code-dot-org/lab';
import {BlocklyLab} from '@code-dot-org/lab';
import {useMemo} from 'react';

import {createMusicApiClient, MusicApiClientProvider} from './api';
import MusicLab from './components/MusicLab';
import {PlayerProvider} from './contexts/PlayerContext';

import styles from './app.module.scss';

const App = ({...props}: Omit<BlocklyLabProps, 'defaultSources'>) => {
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/music\/([^/]+)\/edit$/,
  )?.[1];

  const api = useApiClient();
  const musicApi = useMemo(
    () => (api ? createMusicApiClient(api) : undefined),
    [api],
  );

  return (
    <>
      {/* The generic styles to base the lab styles upon */}
      <div className={styles.app}>
        {/* The BlocklyLab wraps the sources and other lab reduxes */}
        <BlocklyLab
          {...props}
          defaultSources={{source: {}}}
          standaloneProjectType="music"
          channelId={props.channelId || channelId}
        >
          {musicApi && (
            <MusicApiClientProvider client={musicApi}>
              {/* Wraps the music player instance and all callbacks/methods for playback */}
              <PlayerProvider api={musicApi}>
                {/* The lab interfaces themselves */}
                <MusicLab />
              </PlayerProvider>
            </MusicApiClientProvider>
          )}
        </BlocklyLab>
      </div>
    </>
  );
};

export default App;
