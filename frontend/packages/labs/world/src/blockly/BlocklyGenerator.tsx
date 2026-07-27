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

import {assembleActorModule, assembleSceneModule} from './assembleActorModule';
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
        // `workspaceToCode`'s position ordering (see assembleActorModule).
        // Generate each top block's code, then let assembleActorModule order
        // them deterministically — the actor first, then the floating handlers,
        // then the default export.
        const asString = (code: string | [string, number]): string =>
          Array.isArray(code) ? code[0] : code;
        generator.init(workspace);
        const generated = workspace.getTopBlocks(true).map(block => ({
          type: block.type,
          code: asString(generator.blockToCode(block)),
        }));
        // A scene file is rooted by `world_scene`; anything else is an actor.
        const assemble = generated.some(b => b.type === 'world_scene')
          ? assembleSceneModule
          : assembleActorModule;
        return generator.finish(assemble(generated));
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
