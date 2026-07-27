import {useCallback, useMemo, useRef} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
  type BlocklySerialization,
  type Toolbox,
} from '@code-dot-org/blockly';
import type {CustomEditorProps} from '@code-dot-org/codebridge';

import styles from './blocklyFileEditor.module.css';

// A `.rule` / `.actor` file is a Blockly workspace stored as serialized JSON
// (INTERFACE.md). This is the editor Codebridge mounts for those languages via
// the `editorComponents` seam. It reads the file's JSON into a Blockly
// workspace and writes the workspace back out on every change — through the
// same `onChange` seam the CodeMirror editor uses, so persistence is identical.
//
// The toolbox is a small starter set of stock blocks for now; domain blocks
// (Rules/Traits/Actors/Events) and the Blockly → world-lab code generation are
// the next increment.

const STARTER_TOOLBOX: Toolbox = [
  {name: 'Logic', blocks: ['controls_if', 'logic_compare', 'logic_boolean']},
  {name: 'Loops', blocks: ['controls_repeat_ext']},
  {name: 'Math', blocks: ['math_number', 'math_arithmetic']},
  {name: 'Text', blocks: ['text', 'text_print']},
  {name: 'Variables', blocks: ['variables_get', 'variables_set']},
];

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
      <BlocklyProvider>
        <BlocklyWorkspace
          className={styles.workspace}
          startBlocks={startBlocks}
          toolbox={STARTER_TOOLBOX}
          options={options}
          workspaceRef={workspaceRef}
          onChange={handleChange}
        />
      </BlocklyProvider>
    </div>
  );
};

export default BlocklyFileEditor;
