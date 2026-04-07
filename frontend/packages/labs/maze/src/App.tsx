import {useApiClient, useThemeSettings} from '@code-dot-org/core/api';
import {registerLevelKindSchema} from '@code-dot-org/core/api';
import {themes, themeOptions} from '@code-dot-org/blockly-workspace/themes';
import {BlocklyLab} from '@code-dot-org/lab';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import BlockLimitsPlugin from '@code-dot-org/blockly-workspace/plugins/blockLimits';
import DisableOrphansPlugin from '@code-dot-org/blockly-workspace/plugins/disableOrphans';
import GrayOutUndeletableBlocksPlugin from '@code-dot-org/blockly-workspace/plugins/grayOutUndeletableBlocks';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import blocks from './blocks';
import skins, {skinFor} from './skins';

import MazeLab from './components/MazeLab';

import {LevelKindSchema} from './schema';
import type {MazeLevelProperties} from './types';

import styles from './app.module.scss';

const BLOCKLY_THEME = 'blocklyTheme';

registerLevelKindSchema('maze', LevelKindSchema);

function App() {
  // Just use the channelId to pretend to be the level id
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/maze\/([^/]+)\/edit$/,
  )?.[1];

  // Pull the theme from the user themes and supply this as the initial theme
  const api = useApiClient();
  const {data: themeSettings} = useThemeSettings(api, {
    errorCallback: () => ({
      blockly: localStorage.getItem(BLOCKLY_THEME) || themeOptions[0].value,
    }),
  });
  const initialTheme = themeSettings?.blockly || themeOptions[0].value;

  return (
    <>
      <div className={styles.app}>
        <BlocklyLab<MazeLevelProperties>
          isLoading={false}
          levelId={channelId}
          blocklyProps={(levelProperties: MazeLevelProperties) => ({
            theme: themes[initialTheme],
            renderer: ThrasosRenderer,
            blocks: blocks(skinFor(skins, levelProperties?.skin || 'birds')),
            plugins: [
              ToolboxTrashcanPlugin,
              BlockLimitsPlugin,
              DisableOrphansPlugin,
              GrayOutUndeletableBlocksPlugin,
            ],
          })}
        >
          <MazeLab />
        </BlocklyLab>
      </div>
    </>
  );
}

export default App;
