import type {JavascriptGenerator} from 'blockly/javascript';
import {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useMemo,
  useRef,
  type MutableRefObject,
} from 'react';

import {
  Blockly,
  BlocklyProvider,
  BlocklyWorkspace,
} from '@code-dot-org/blockly';

import {assembleActorModule, assembleWorldModule} from './assembleActorModule';
import styles from './blocklyGenerator.module.css';
import {buildDomainPalette} from './domainBlocks';
import {
  extractRuleBodies,
  parseRuleMeta,
  ruleMetaToModule,
  type RuleMeta,
} from './ruleMeta';

// Headless Blockly → world-lab code generation for `.rule`/`.actor` files
// (INTERFACE.md). Blockly's generator lives on a workspace, exposed via the
// workspace's `javascriptGeneratorRef`, so we mount one offscreen Blockly
// workspace (with the domain blocks and their generators registered through the
// `blocks` prop) and reuse it for every file: load the file's JSON, then
// `workspaceToCode`. The runtime provider owns this and calls `generate` in the
// source transform before compiling.

export interface BlocklyGeneratorHandle {
  /**
   * Generate the JavaScript module for a Blockly file's JSON. `path` is the
   * file's project path — needed for a `.rule` (its module path names where its
   * own members are imported from, and marks self-references as local).
   */
  generate: (contents: string, path?: string) => string;
}

export const BlocklyGenerator = forwardRef<
  BlocklyGeneratorHandle,
  {onReady?: () => void; projectRules?: readonly RuleMeta[]}
>(function BlocklyGenerator({onReady, projectRules}, ref) {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const generatorRef: MutableRefObject<JavascriptGenerator | null> =
    useRef(null);

  // The palette + root-block types for this project: the built-ins extended with
  // the project's own `.rule` rules. Setting `blocks` re-registers on the live
  // workspace (Driver.blocks), so the generator knows a project rule's blocks.
  const {blocks, rootTypes} = useMemo(
    // Every rule's own read-only setters: this palette generates ALL of the
    // project's Blockly files, so it cannot be scoped to one `.rule` the way the
    // editor's is. It is never shown, so the extra blocks cost nothing.
    () => buildDomainPalette(projectRules ?? [], {allRuleModules: true}),
    [projectRules],
  );
  // `generate` is a stable closure; read the current root types through a ref.
  const rootTypesRef = useRef(rootTypes);
  rootTypesRef.current = rootTypes;

  useImperativeHandle(
    ref,
    () => ({
      generate(contents, path) {
        const workspace = workspaceRef.current;
        const generator = generatorRef.current;
        if (!workspace || !generator) {
          throw new Error('Blockly generator is not ready');
        }
        // Tag this offscreen workspace so a renderer-dependent mutator (the
        // params `+`/`−`) skips its visual rebuild here — it can't draw fields,
        // and only the serialized state / generated body is read. Set on every
        // call (inject timing can't be relied on) before any block loads.
        (workspace as {isRuleGenerator?: boolean}).isRuleGenerator = true;
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
        // The domain blocks emit these bare identifiers (the principal actor, the
        // world, an event's value). Reserve them so a Blockly variable
        // (e.g. a `for each` loop's actor variable) is never named to collide —
        // it gets a numbered suffix instead of shadowing the identifier.
        generator.addReservedWords('actor,world,eventValue,delta');
        generator.init(workspace);

        // A `.rule` file: the declarative scaffolding comes from its metadata
        // (parsed statically), but each action/query has an imperative body that
        // IS real code, generated from its `do` blocks here. `__ruleModule` marks
        // this module so a body referencing the rule's own member uses the local
        // `export const`, not an import of the module into itself.
        const ruleRoot = workspace
          .getTopBlocks(true)
          .find(block => block.type === 'world_rule');
        if (ruleRoot) {
          const modulePath = (path ?? '').replace(/\.rule$/, '');
          const meta = parseRuleMeta(modulePath, contents);
          if (!meta) {
            return generator.finish('export {};\n');
          }
          (generator as {__ruleModule?: string}).__ruleModule = modulePath;
          const bodies = extractRuleBodies(ruleRoot, {
            body: block =>
              generator.statementToCode(block as Blockly.Block, 'DO'),
            // The params mutator stores each param's variable id in extraState;
            // map them to the safe JS identifiers the body's getters resolve to,
            // so the closure signature and the getters agree.
            signature: block => {
              const state = (
                block as {
                  saveExtraState?: () => {params?: Array<{var: string}>};
                }
              ).saveExtraState?.();
              return (state?.params ?? []).map(param =>
                generator.getVariableName(param.var),
              );
            },
          });
          (generator as {__ruleModule?: string}).__ruleModule = undefined;
          return generator.finish(ruleMetaToModule(meta, bodies));
        }

        // A root block (an event handler, or an actor/world definition)
        // owns the blocks chained below it as its body and generates that chain
        // itself — so generate it `thisOnly` to stop `scrub_` from also appending
        // the chain after it.
        const generated = workspace.getTopBlocks(true).map(block => ({
          type: block.type,
          code: asString(
            generator.blockToCode(block, rootTypesRef.current.has(block.type)),
          ),
        }));
        // Route by the root block: `world_world` → world, otherwise an actor.
        const assemble = generated.some(b => b.type === 'world_world')
          ? assembleWorldModule
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
      <BlocklyProvider blocks={blocks}>
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
