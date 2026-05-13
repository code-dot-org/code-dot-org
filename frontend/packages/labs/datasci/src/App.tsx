import {registerLevelKindSchema} from '@code-dot-org/core/api';
import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import {BlocklyLab, type BlocklyLabProps} from '@code-dot-org/lab';

import blocks from './blocks';
import DatasciLab from './components/DatasciLab';
import {LevelKindSchema} from './schema';
import type {DatasciLevelProperties} from './types';

import styles from './app.module.scss';

registerLevelKindSchema('datasci', LevelKindSchema);

/**
 * Datasci Lab entry. Accepts caller-supplied `BlocklyLab` props (typically
 * `standaloneProjectType` and/or `levelId`) so it can be mounted both at the
 * `/app/projects/datasci/:channelId/edit` route and embedded in another
 * surface (e.g., the guided-lesson stage).
 */
function App(props: Partial<BlocklyLabProps<DatasciLevelProperties>> = {}) {
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/datasci\/([^/]+)\/edit$/,
  )?.[1];

  return (
    <div className={styles.app}>
      <BlocklyLab<DatasciLevelProperties>
        {...props}
        isLoading={false}
        levelId={props.levelId || channelId}
        blocklyProps={() => ({
          renderer: ThrasosRenderer,
          blocks,
          plugins: [ToolboxTrashcanPlugin],
        })}
      >
        <DatasciLab />
      </BlocklyLab>
    </div>
  );
}

export default App;
