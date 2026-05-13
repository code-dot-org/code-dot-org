import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import {registerLevelKindSchema} from '@code-dot-org/core/api';
import {BlocklyLab, type BlocklyLabProps} from '@code-dot-org/lab';

import blocks from './blocks';
import AiTrainerLab from './components/AiTrainerLab';
import {LevelKindSchema} from './schema';
import type {AiTrainerLevelProperties} from './types';

import styles from './app.module.scss';

registerLevelKindSchema('ai_trainer', LevelKindSchema);

function App(props: Partial<BlocklyLabProps<AiTrainerLevelProperties>> = {}) {
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/ai-trainer\/([^/]+)\/edit$/,
  )?.[1];

  return (
    <div className={styles.app}>
      <BlocklyLab<AiTrainerLevelProperties>
        {...props}
        isLoading={false}
        levelId={props.levelId || channelId}
        blocklyProps={() => ({
          renderer: ThrasosRenderer,
          blocks,
          plugins: [ToolboxTrashcanPlugin],
        })}
      >
        <AiTrainerLab />
      </BlocklyLab>
    </div>
  );
}

export default App;
