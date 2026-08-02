import {CodebridgeLab} from '@code-dot-org/codebridge';
import {registerLevelKindSchema} from '@code-dot-org/core/api';

import styles from './app.module.css';
import {WorldBlocklyThemeProvider} from './blockly/worldBlocklyTheme';
import {worldConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import WorldLayout from './layout/WorldLayout';
import {WorldRuntimeProvider} from './runtime/WorldRuntimeContext';
import {LevelKindSchema} from './schema';

// At import, before any level properties are fetched: an unregistered kind is
// parsed against the base schema alone, which drops `levelData` on the floor.
registerLevelKindSchema('world', LevelKindSchema);

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
        <WorldBlocklyThemeProvider>
          <WorldLayout />
        </WorldBlocklyThemeProvider>
      </WorldRuntimeProvider>
    </CodebridgeLab>
  </div>
);

export default WorldLab;
