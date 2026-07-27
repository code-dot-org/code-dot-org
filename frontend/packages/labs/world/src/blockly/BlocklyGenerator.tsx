import type {JavascriptGenerator} from 'blockly/javascript';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  type MutableRefObject,
} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
} from '@code-dot-org/blockly';

import styles from './blocklyGenerator.module.css';
import {DOMAIN_BLOCKS} from './domainBlocks';

// Headless Blockly → world-lab code generation for `.rule`/`.actor` files
// (INTERFACE.md). Blockly's generator lives on a workspace, exposed via the
// workspace's `javascriptGeneratorRef`, so we mount one offscreen Blockly
// workspace (with the domain blocks and their generators registered through the
// `blocks` prop) and reuse it for every file: load the file's JSON, then
// `workspaceToCode`. The runtime provider owns this and calls `generate` in the
// source transform before compiling.

export interface BlocklyGeneratorHandle {
  /** Generate the JavaScript module for a Blockly file's JSON. */
  generate: (contents: string) => string;
}

export const BlocklyGenerator = forwardRef<
  BlocklyGeneratorHandle,
  {onReady?: () => void}
>(function BlocklyGenerator({onReady}, ref) {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const generatorRef: MutableRefObject<JavascriptGenerator | null> =
    useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      generate(contents) {
        const workspace = workspaceRef.current;
        const generator = generatorRef.current;
        if (!workspace || !generator) {
          throw new Error('Blockly generator is not ready');
        }
        workspace.clear();
        const state = contents.trim() ? JSON.parse(contents) : {};
        Blockly.serialization.workspaces.load(state, workspace);

        // Events are their own top-level blocks, so we can't rely on
        // `workspaceToCode`'s position ordering: an event dragged above the
        // actor would emit `actor.on(...)` before `const actor` (a TDZ error).
        // Assemble deterministically instead — the actor block first, then the
        // floating event handlers, then the default export. `export default`
        // captures the actor object by reference, so handlers that register
        // after it still mutate the exported instance.
        const asString = (code: string | [string, number]): string =>
          Array.isArray(code) ? code[0] : code;
        const tops = workspace.getTopBlocks(true);
        const actorBlock = tops.find(block => block.type === 'world_actor');
        const eventBlocks = tops.filter(block => block !== actorBlock);

        generator.init(workspace);
        const actorCode = actorBlock
          ? asString(generator.blockToCode(actorBlock))
          : '';
        const eventsCode = eventBlocks
          .map(block => asString(generator.blockToCode(block)))
          .join('');
        return generator.finish(
          `${actorCode}${eventsCode}export default actor;\n`,
        );
      },
    }),
    [],
  );

  // Fires once the workspace is injected and its generator ref is populated.
  const handleInject = useCallback(() => onReady?.(), [onReady]);

  return (
    <div className={styles.offscreen} aria-hidden="true">
      <BlocklyProvider blocks={DOMAIN_BLOCKS}>
        <BlocklyWorkspace
          options={{readOnly: true, trashcan: false}}
          workspaceRef={workspaceRef}
          javascriptGeneratorRef={generatorRef}
          onInject={handleInject}
        />
      </BlocklyProvider>
    </div>
  );
});

export default BlocklyGenerator;
