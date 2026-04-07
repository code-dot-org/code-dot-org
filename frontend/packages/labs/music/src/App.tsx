import {registerLevelKindSchema} from '@code-dot-org/core/api';
import {useApiClient} from '@code-dot-org/core/api';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import type {BlocklyLabWithSourcesProps} from '@code-dot-org/lab';
import {BlocklyLabWithSources} from '@code-dot-org/lab';
import {useMemo} from 'react';

import {createMusicApiClient, MusicApiClientProvider} from './api';
import blocks from './blockly/blocks/simple2';
import MusicLab from './components/MusicLab';
import {PlayerProvider} from './contexts/PlayerContext';
import {LevelKindSchema} from './schema';

import styles from './app.module.scss';

const plugins = [ToolboxTrashcanPlugin];

registerLevelKindSchema('music', LevelKindSchema);

const App = ({
  ...props
}: Omit<BlocklyLabWithSourcesProps, 'defaultSources' | 'blocklyProps'>) => {
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
        {/* The BlocklyLabWithSources wraps the sources and other lab reduxes */}
        <BlocklyLabWithSources
          {...props}
          defaultSources={{source: {}}}
          standaloneProjectType="music"
          channelId={props.channelId || channelId}
          blocklyProps={_ => {
            return {
              renderer: ThrasosRenderer,
              blocks,
              plugins,
            };
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
        </BlocklyLabWithSources>
      </div>
    </>
  );
};

export default App;
