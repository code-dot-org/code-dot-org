import {useCallback, useMemo, useRef} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
  type BlocklySerialization,
} from '@code-dot-org/blockly';
import type {CustomEditorProps} from '@code-dot-org/codebridge';

import styles from './blocklyFileEditor.module.css';
import {DOMAIN_BLOCKS, DOMAIN_TOOLBOX} from './domainBlocks';

// A `.rule` / `.actor` file is a Blockly workspace stored as serialized JSON
// (INTERFACE.md). This is the editor Codebridge mounts for those languages via
// the `editorComponents` seam. It reads the file's JSON into a Blockly
// workspace and writes the workspace back out on every change — through the
// same `onChange` seam the CodeMirror editor uses, so persistence is identical.
//
// The toolbox is the World Lab domain blocks (Actor / Traits / Events); passing
// `DOMAIN_BLOCKS` registers them (and their world-lab generators) on this
// workspace, the same definitions the generator uses.

/** Parse a file's contents into workspace state; empty/invalid → a blank workspace. */
function parseWorkspace(contents: string): BlocklySerialization {
  if (!contents.trim()) {
    return {};
  }
  try {
    return JSON.parse(contents) as BlocklySerialization;
  } catch {
    return {};
  }
}

export const BlocklyFileEditor = ({
  initialContents,
  isReadOnly,
  onChange,
}: CustomEditorProps) => {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  // Parsed once: Codebridge keys this component by file id, so it remounts (and
  // re-reads `initialContents`) when the active file changes.
  const startBlocks = useRef(parseWorkspace(initialContents)).current;

  const options = useMemo(
    () => ({
      readOnly: isReadOnly,
      trashcan: true,
      move: {wheel: true, drag: true, scrollbars: true},
    }),
    [isReadOnly],
  );

  const handleChange = useCallback(
    (event: Blockly.Events.Abstract) => {
      const workspace = workspaceRef.current;
      // Ignore pure UI events (selection, viewport) — only persist real edits.
      if (!workspace || event.isUiEvent) {
        return;
      }
      const state = Blockly.serialization.workspaces.save(
        workspace,
      ) as BlocklySerialization;
      onChange(JSON.stringify(state, null, 2));
    },
    [onChange],
  );

  return (
    <div className={styles.editor}>
      <BlocklyProvider blocks={DOMAIN_BLOCKS}>
        <BlocklyWorkspace
          className={styles.workspace}
          startBlocks={startBlocks}
          toolbox={DOMAIN_TOOLBOX}
          options={options}
          workspaceRef={workspaceRef}
          onChange={handleChange}
        />
      </BlocklyProvider>
    </div>
  );
};

export default BlocklyFileEditor;
