import {CodebridgeLab} from '@code-dot-org/codebridge';

import styles from './app.module.css';
import {worldConfig} from './config';
import {DEFAULT_PROJECT} from './constants';
import WorldLayout from './layout/WorldLayout';

/**
 * The World Lab entrypoint. Composes the Codebridge shell: `CodebridgeLab`
 * provides the multi-file sources, config, and lab context; {@link WorldLayout}
 * lays out the instructions, workspace, and world preview.
 *
 * There is no runtime provider yet — the preview is a placeholder until the
 * Phaser 4 runtime is wired in (see `preview/WorldPreview`).
 */
// Self-contained: the studio host renders the single `<Lab>` (see LabHost) and
// publishes level data to context, so the entrypoint takes no props.
const WorldLab = () => (
  <div className={styles.app}>
    <CodebridgeLab config={worldConfig} defaultSources={DEFAULT_PROJECT}>
      <WorldLayout />
    </CodebridgeLab>
  </div>
);

export default WorldLab;
