import MusicLab from './components/MusicLab';
import type {BlocklyLabProps} from '@code-dot-org/lab';
import {BlocklyLab} from '@code-dot-org/lab';

import styles from './app.module.scss';
import {PlayerProvider} from './contexts/PlayerContext';

const App = ({...props}: Omit<BlocklyLabProps, 'defaultSources'>) => (
  <div className={styles.app}>
    <BlocklyLab defaultSources={{source: {}}} {...props}>
      <PlayerProvider>
        <MusicLab levelProperties={props.levelProperties} />
      </PlayerProvider>
    </BlocklyLab>
  </div>
);

export default App;
