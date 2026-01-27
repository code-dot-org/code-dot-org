import MusicLab from './components/MusicLab';
import type {BlocklyLabProps} from '@code-dot-org/lab';
import {BlocklyLab} from '@code-dot-org/lab';

import styles from './app.module.scss';
import {PlayerProvider} from './contexts/PlayerContext';

const App = ({levelId, ...props}: Omit<BlocklyLabProps, 'defaultSources'>) => {
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/music\/([^/]+)\/edit$/,
  )?.[1];

  console.log('hmm', channelId, props.channelId || channelId);

  return (
    <>
      {/* The generic styles to base the lab styles upon */}
      <div className={styles.app}>
        {/* The BlocklyLab wraps the sources and other lab reduxes */}
        <BlocklyLab
          defaultSources={{source: {}}}
          levelId={levelId || '62733'}
          channelId={props.channelId || channelId}
          {...props}
        >
          {/* Wraps the music player instance and all callbacks/methods for playback */}
          <PlayerProvider>
            {/* The lab interfaces themselves */}
            <MusicLab />
          </PlayerProvider>
        </BlocklyLab>
      </div>
    </>
  );
};

export default App;
