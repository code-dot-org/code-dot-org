import ToolboxTrashcanPlugin from '@code-dot-org/blockly-workspace/plugins/toolboxTrashcan';
import ThrasosRenderer from '@code-dot-org/blockly-workspace/renderers/thrasos';
import type {BlocklyLabProps} from '@code-dot-org/lab';
import {BlocklyLab} from '@code-dot-org/lab';

import skins, {skinFor} from './skins';
import blocks from './blocks';
import MazeLab from './components/MazeLab';

import styles from './app.module.scss';

const plugins = [ToolboxTrashcanPlugin];

const App = ({
  ...props
}: Omit<BlocklyLabProps, 'defaultSources' | 'blocklyProps'>) => {
  const channelId = window.location.pathname.match(
    /^\/app\/projects\/maze\/([^/]+)\/edit$/,
  )?.[1];

  return (
    <>
      {/* The generic styles to base the lab styles upon */}
      <div className={styles.app}>
        {/* The BlocklyLab wraps the sources and other lab reduxes */}
        <BlocklyLab
          {...props}
          defaultSources={{source: {}}}
          standaloneProjectType="maze"
          channelId={props.channelId || channelId}
          blocklyProps={{
            renderer: ThrasosRenderer,
            blocks: blocks(skinFor(skins, 'birds')),
            plugins,
          }}
        >
          {/* The lab interfaces themselves */}
          <MazeLab />
        </BlocklyLab>
      </div>
    </>
  );
};

export default App;
