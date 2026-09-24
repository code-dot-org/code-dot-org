import type {ComponentType} from 'react';

import type {CustomEditorProps} from '@code-dot-org/codebridge';

import {GeneratedCodeView} from './GeneratedCodeView';
import {useShowCode} from './showCode';

/**
 * An editor that shows the file's JavaScript instead, when that is asked for.
 *
 * Applied in `config.editorComponents` to the file kinds that are authored in
 * blocks (`.rule`, `.actor`, `.world`, `.map`), which are exactly the kinds
 * that compile to a module worth reading.
 *
 * AROUND EACH EDITOR RATHER THAN AROUND THE WORKSPACE. Swapping Codebridge's
 * `Workspace` in the layout would have been fewer lines and would have taken
 * the file tabs and the folder menus with it — so a reader could not move
 * between files without leaving the code first. Here the swap is under the
 * tabs, where the editor already is.
 *
 * The editor UNMOUNTS while the code is up, which is the same cost as switching
 * to another file and back: the workspace is rebuilt, its scroll position is
 * lost, and a `define block`'s body that was open returns to the file. Nothing
 * is lost with it — the editor writes every change to the sources as it is made
 * — and the alternative, a live Blockly workspace hidden behind the code, is a
 * workspace measuring itself at zero size (`BlocklyFileEditor.layOut`).
 */
export const orShowCode = (
  Editor: ComponentType<CustomEditorProps>,
): ComponentType<CustomEditorProps> => {
  const OrShowCode = (props: CustomEditorProps) => {
    const {showing} = useShowCode();
    return showing ? (
      <GeneratedCodeView fileId={props.fileId} />
    ) : (
      <Editor {...props} />
    );
  };
  // Named for the stack traces and the React devtools, where a wrapper with no
  // name is a wrapper nobody can find.
  OrShowCode.displayName = `orShowCode(${Editor.displayName ?? Editor.name ?? 'Editor'})`;
  return OrShowCode;
};
