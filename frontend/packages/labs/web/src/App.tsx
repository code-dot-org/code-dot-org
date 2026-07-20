import {CodebridgeLab} from '@code-dot-org/codebridge';

import styles from './app.module.css';
import {webConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import WebLayout from './layout/WebLayout';

/**
 * The Web Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; {@link WebLayout}
 * lays out the instructions, workspace, and page preview.
 *
 * There is no runtime provider yet — Web Lab has no Run/Stop (the preview
 * re-renders as the project changes), and its console is the debug panel rather
 * than the Codebridge one. Both arrive with the preview increment.
 */
// Self-contained: the studio host renders the single `<Lab>` (see LabHost) and
// publishes level data to context, so the entrypoint takes no props.
const WebLab = () => (
  <div className={styles.app}>
    <CodebridgeLab config={webConfig} defaultSources={DEFAULT_PROJECT}>
      <WebLayout />
    </CodebridgeLab>
  </div>
);

export default WebLab;
