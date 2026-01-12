import MusicLab from './components/MusicLab';
import {LevelKind} from '@code-dot-org/api/models/levels';
import {RootStateProvider} from '@code-dot-org/redux/providers';
import {ThemeProvider} from '@code-dot-org/component-library/common/contexts';
import '@code-dot-org/lab/redux';

function App() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <RootStateProvider>
        <ThemeProvider>
          <MusicLab
            level={{
              key: 'music-lab-test',
              type: 'Music',
              kind: LevelKind.activity,
              url: '/music/',
              subData: {},
            }}
          />
        </ThemeProvider>
      </RootStateProvider>
    </div>
  );
}

export default App;
