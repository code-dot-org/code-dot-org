import {Button, Typography} from '@mui/material';
import {useEffect, useRef, useState} from 'react';

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import type {MultiFileSource} from '@code-dot-org/core/api';
import {useSources} from '@code-dot-org/lab/contexts';

import {filePath} from '../runtime/projectFiles';
import {useWorldRuntime} from '../runtime/WorldRuntimeContext';

import {generatedCodeFor, type CodeView} from './generatedCode';
import styles from './generatedCodeView.module.css';
import {useShowCode} from './showCode';

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
 * The JavaScript a Blockly file becomes, in the editor's place.
 *
 * A World project is authored in blocks and RUNS as JavaScript, and until this
 * the second half was seen by nothing but the compiler and the AI Tutor. The
 * "JavaScript" button in the workspace header swaps the pane for this, and this
 * swaps it back (`debug/showCode`).
 *
 * IN THE PANE RATHER THAN IN A DIALOG, which is the shape the lab already uses
 * for opening a `define block`'s body: the pane is the same pane and what
 * changed is what is in it. Swapped around each Blockly editor rather than
 * around Codebridge's whole `Workspace` (`config.editorComponents`), so the
 * file tabs and the folder menus stay where they are and a reader can move
 * between files without going back first.
 *
 * FROM THE FILE, NOT FROM A WORKSPACE, and that is not a detail. With a `define
 * block`'s body open the editor's workspace holds that one member's
 * implementation and nothing else (`blockly/bodySurfaces`); the file is the
 * whole actor, and the whole actor is what compiles.
 */
export const GeneratedCodeView = ({fileId}: {fileId: string}) => {
  const {currentSources} = useSources<MultiFileSource>();
  // `hasCompiled` is in the dependencies below rather than used here: the
  // generator is mounted by the runtime and is not ready for the first moments
  // of a page load, and this is the signal that it has become so.
  const {generateFile, hasCompiled} = useWorldRuntime();
  const {hide} = useShowCode();

  // By id, not by "whichever file is active": this view is rendered AS an
  // editor, so the file it is for is the file it was handed.
  const path = filePath(currentSources.source, fileId);
  const contents = currentSources.source.files[fileId]?.contents;

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
    <div className={styles.pane}>
      {/* The same bar a body surface gets, and for the same reason: it says
          what is in the pane and how to get out of it. */}
      <div className={styles.header}>
        <Button
          variant="text"
          size="extraSmall"
          startIcon={
            <FontAwesomeV6Icon iconName="arrow-left" iconStyle="solid" />
          }
          onClick={hide}
        >
          Back
        </Button>
        <Typography component="span" variant="label2">
          JavaScript
        </Typography>
        {path && <span className={styles.path}>{path}</span>}
      </div>
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
          // Worth showing rather than hiding: a file that will not generate is
          // a file the project cannot run, and today that surfaces only as the
          // whole world failing to compile, named after nothing in particular.
          <div className={styles.error}>
            This file did not generate: {view.message}
          </div>
        )}
        {view.kind === 'none' && (
          <div className={styles.empty}>{view.reason}</div>
        )}
      </div>
    </div>
  );
};

export default GeneratedCodeView;
