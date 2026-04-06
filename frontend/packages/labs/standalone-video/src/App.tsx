import {registerLevelKindSchema} from '@code-dot-org/core/api';
import {Lab} from '@code-dot-org/lab';

import StandaloneVideoLab from './components/StandaloneVideoLab';

import {LevelKindSchema} from './schema';

import styles from './app.module.scss';

registerLevelKindSchema('standalone_video', LevelKindSchema);

function App() {
  // Just use the channelId to pretend to be the level id
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/standalone-video\/([^/]+)\/edit$/,
  )?.[1];

  return (
    <>
      <div className={styles.app}>
        <Lab
          isLoading={false}
          levelId={channelId}
        >
          <StandaloneVideoLab />
        </Lab>
      </div>
    </>
  );
}

export default App;
