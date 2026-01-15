import MusicLab from './components/MusicLab';
import {LevelKind} from '@code-dot-org/api/models/levels';
import {Lab} from '@code-dot-org/lab';

import styles from './app.module.scss';
import {PlayerProvider} from './contexts/PlayerContext';

function App() {
  return (
    <div className={styles.app}>
      <Lab isLoading={false}>
        <PlayerProvider>
          <MusicLab
            levelProperties={{
              id: 1,
              appName: 'music',
              key: 'music-lab-demo',
              url: '/music-lab-demo',
              longInstructions:
                'This is a demo of music lab within a vite application',
              type: 'music',
              kind: LevelKind.activity,
              offerBrowserTts: true,
              levelData: {
                allowChangeStartingPlayheadPosition: true,
                library: 'launch2024',
              },
            }}
          />
        </PlayerProvider>
      </Lab>
    </div>
  );
}

export default App;
