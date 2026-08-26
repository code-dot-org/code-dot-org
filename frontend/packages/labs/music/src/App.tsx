import {registerLevelKindSchema, useApiClient} from '@code-dot-org/core/api';
import {darkTheme} from '@code-dot-org/blockly/themes';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly/plugins/toolboxTrashcan';
import ScrollOptionsPlugin from '@code-dot-org/blockly/plugins/scrollOptions';
import ThrasosRenderer from '@code-dot-org/blockly/renderers/thrasos';
import type {BlocklyLabProps} from '@code-dot-org/lab-classic';
import {BlocklyLab} from '@code-dot-org/lab-classic';
import {useMemo} from 'react';

import {createMusicApiClient, MusicApiClientProvider} from './api';
import blocks from './blockly/blocks/simple2';
import MusicLab from './components/MusicLab';
import {PlayerProvider} from './contexts/PlayerContext';
import {LevelKindSchema} from './schema';

import styles from './app.module.scss';

// Register the music level kind so music-specific properties (notably
// `levelData`) survive level-properties validation; the base parse drops
// unknown keys otherwise.
registerLevelKindSchema('music', LevelKindSchema);

const plugins = [ToolboxTrashcanPlugin, ScrollOptionsPlugin];

const App = ({
  ...props
}: Omit<BlocklyLabProps, 'defaultSources' | 'blocklyProps'>) => {
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
          blocklyProps={{
            theme: darkTheme,
            renderer: ThrasosRenderer,
            blocks,
            plugins,
          }}
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
