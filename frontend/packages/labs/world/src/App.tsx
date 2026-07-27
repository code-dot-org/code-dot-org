import {CodebridgeLab} from '@code-dot-org/codebridge';

import styles from './app.module.css';
import {worldConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import WorldLayout from './layout/WorldLayout';
import {WorldRuntimeProvider} from './runtime/WorldRuntimeContext';

/**
 * The World Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; the
 * {@link WorldRuntimeProvider} drives the sandbox (compile on edit, run in the
 * preview, collect console); {@link WorldLayout} lays out the instructions,
 * workspace, world preview, and console.
 */
// Self-contained: the studio host renders the single `<Lab>` (see LabHost) and
// publishes level data to context, so the entrypoint takes no props.
const WorldLab = () => (
  <div className={styles.app}>
    <CodebridgeLab config={worldConfig} defaultSources={DEFAULT_PROJECT}>
      <WorldRuntimeProvider>
        <WorldLayout />
      </WorldRuntimeProvider>
    </CodebridgeLab>
  </div>
);

export default WorldLab;
