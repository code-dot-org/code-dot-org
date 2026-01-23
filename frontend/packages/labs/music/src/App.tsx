import MusicLab from './components/MusicLab';
import type {BlocklyLabProps} from '@code-dot-org/lab';
import {BlocklyLab} from '@code-dot-org/lab';

import styles from './app.module.scss';
import {PlayerProvider} from './contexts/PlayerContext';

const App = ({...props}: Omit<BlocklyLabProps, 'defaultSources'>) => (
  <>
    {/* The generic styles to base the lab styles upon */}
    <div className={styles.app}>
      {/* The BlocklyLab wraps the sources and other lab reduxes */}
      <BlocklyLab defaultSources={{source: {}}} {...props}>
        {/* Wraps the music player instance and all callbacks/methods for playback */}
        <PlayerProvider>
          {/* The lab interfaces themselves */}
          <MusicLab levelProperties={props.levelProperties} />
        </PlayerProvider>
      </BlocklyLab>
    </div>
  </>
);

export default App;
