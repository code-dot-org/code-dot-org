import {CodebridgeLab} from '@code-dot-org/codebridge';
import type {LevelPropertiesMap} from '@code-dot-org/core/api';

import styles from './app.module.css';
import {webConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import WebLayout from './layout/WebLayout';

/**
 * Host-supplied props for the Web Lab entrypoint — the standard
 * `LabEntrypointProps` loading contract the studio host drives. Forwarded to
 * {@link CodebridgeLab}, which owns sources, theming, and the level-properties
 * context.
 */
export interface WebLabProps {
  isLoading: boolean;
  levelId?: string;
  standaloneProjectType?: string;
  levelPropertiesMap?: LevelPropertiesMap;
}

/**
 * The Web Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; {@link WebLayout}
 * lays out the instructions, workspace, and page preview.
 *
 * There is no runtime provider yet — Web Lab has no Run/Stop (the preview
 * re-renders as the project changes), and its console is the debug panel rather
 * than the Codebridge one. Both arrive with the preview increment.
 */
const WebLab = (props: WebLabProps) => (
  <div className={styles.app}>
    <CodebridgeLab
      {...props}
      config={webConfig}
      defaultSources={DEFAULT_PROJECT}
    >
      <WebLayout />
    </CodebridgeLab>
  </div>
);

export default WebLab;
