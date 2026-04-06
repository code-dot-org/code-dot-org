import {registerLevelKindSchema} from '@code-dot-org/core/api';
import {BlocklyLab} from '@code-dot-org/lab';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import BlockLimitsPlugin from '@code-dot-org/blockly-workspace/plugins/blockLimits';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import blocks from './blocks';
import skins, {skinFor} from './skins';

import MazeLab from './components/MazeLab';

import {LevelKindSchema} from './schema';
import type {MazeLevelProperties} from './types';

import styles from './app.module.scss';

registerLevelKindSchema('maze', LevelKindSchema);

function App() {
  // Just use the channelId to pretend to be the level id
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/maze\/([^/]+)\/edit$/,
  )?.[1];

  return (
    <>
      <div className={styles.app}>
        <BlocklyLab<MazeLevelProperties>
          isLoading={false}
          levelId={channelId}
          blocklyProps={(levelProperties: MazeLevelProperties) => ({
            renderer: ThrasosRenderer,
            blocks: blocks(skinFor(skins, levelProperties?.skin || 'birds')),
            plugins: [ToolboxTrashcanPlugin, BlockLimitsPlugin],
          })}
        >
          <MazeLab />
        </BlocklyLab>
      </div>
    </>
  );
}

export default App;
