import {useEffect, useRef, useState} from 'react';

import {getActiveFileForSource} from '@code-dot-org/codebridge';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {PanelContainer} from '@code-dot-org/lab/components';
import {useSources} from '@code-dot-org/lab/contexts';

import {filePath} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import styles from './codePanel.module.css';
import {generatedCodeFor, type CodeView} from './generatedCode';

/**
 * How long to sit still before generating.
 *
 * Generation parses the file, loads it into a headless workspace and walks it —
 * about 30ms for a four-hundred-block rule. That is cheap once and wasteful on
 * every keystroke, and `generateFile` deliberately does not use the compiler's
 * cache (`WorldRuntimeContext`), so nothing else absorbs the repeat. The same
 * wait the runtime uses before recompiling.
 */
const DEBOUNCE_MS = 300;

/**
 * The JavaScript box: what the file open in the editor compiles to.
 *
 * A World project is authored in blocks and RUNS as JavaScript, and until now
 * the second half was not visible anywhere. This shows one file's module — the
 * same text the compiler is handed — beside the blocks it was made from.
 *
 * FROM THE FILE, NOT FROM THE WORKSPACE, and that is not a detail. With a
 * `define block`'s body open, the editor's workspace holds that one member's
 * implementation and nothing else (`blockly/bodySurfaces`); the file on disk is
 * the whole actor. Reading the sources means the panel says the same thing
 * whichever surface happens to be in front of the learner.
 *
 * Placed by WorldLayout in the editor pane, above the console when both are up.
 */
export const CodePanel = () => {
  const {currentSources} = useSources<MultiFileSource>();
  // `hasCompiled` is in the dependencies below rather than used here: the
  // generator is mounted by the runtime and is not ready for the first moments
  // of a page load, and this is the signal that it has become so.
  const {generateFile, hasCompiled} = useWorldRuntime();

  const active = getActiveFileForSource(currentSources.source);
  const path = active && filePath(currentSources.source, active.id);
  const contents = active?.contents;

  /**
   * The runtime's generator, read through a ref.
   *
   * The runtime rebuilds its context value on every render, so `generateFile`
   * is a different function each time and a dependency on it would regenerate
   * the file continuously.
   */
  const generate = useRef(generateFile);
  generate.current = generateFile;

  const [view, setView] = useState<CodeView>({
    kind: 'none',
    reason: 'Reading the file…',
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setView(generatedCodeFor(path, contents, generate.current));
    }, DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [path, contents, hasCompiled]);

  return (
    <div className={styles.slot}>
      <PanelContainer
        id="world-generated-code"
        headerContent="JavaScript"
        rightHeaderContent={
          path && view.kind !== 'none' ? (
            <span className={styles.path}>{path}</span>
          ) : undefined
        }
      >
        <div
          className={styles.code}
          role="region"
          aria-label="Generated JavaScript"
          // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex -- scrollable region requires keyboard access per WCAG 2.2 SC 2.1.1
          tabIndex={0}
        >
          {view.kind === 'code' && (
            <pre className={styles.source}>{view.code}</pre>
          )}
          {view.kind === 'error' && (
            // Worth showing rather than hiding: a file that will not generate
            // is a file the project cannot run, and today that surfaces only as
            // the whole world failing to compile, named after nothing in
            // particular.
            <div className={styles.error}>
              This file did not generate: {view.message}
            </div>
          )}
          {view.kind === 'none' && (
            <div className={styles.empty}>{view.reason}</div>
          )}
        </div>
      </PanelContainer>
    </div>
  );
};

export default CodePanel;
