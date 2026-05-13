import {registerLevelKindSchema} from '@code-dot-org/core/api';
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

registerLevelKindSchema('maze', LevelKindSchema);

interface AppProps {
  /**
   * Optional levelId. When provided, the App uses it directly and skips the
   * URL parsing — used by hosts that embed Maze Lab inline (e.g. the studio
   * guided-lesson stage) where the URL belongs to a parent route and must
   * not be touched.
   */
  levelId?: string;
}

function App({levelId}: AppProps = {}) {
  // Fall back to the legacy URL-based extraction when the host doesn't pass
  // a levelId prop, so standalone deployments keep working.
  const resolvedLevelId =
    levelId ??
    window.location.pathname.match(
      /^\/app\/projects\/maze\/([^/]+)\/edit$/,
    )?.[1];

  return (
    <>
      <div className={styles.app}>
        <BlocklyLab<MazeLevelProperties>
          isLoading={false}
          levelId={resolvedLevelId}
          blocklyProps={(levelProperties: MazeLevelProperties) => ({
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
