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
import {moduleShape} from './fileKind';
import {
  ownPropertyDeclarations,
  parseWorldOwnMeta,
  worldOwnPropertyDeclarations,
  parseActorOwnMeta,
  type OwnMeta,
} from './ownProperties';
import {
  extractRuleBodies,
  parseRuleMeta,
  ruleMetaToModule,
  type RuleMeta,
} from './ruleMeta';
import {standInBlocks} from './standInBlocks';

// Headless Blockly → world-lab code generation for `.rule`/`.actor` files
// (INTERFACE.md). Blockly's generator lives on a workspace, so an offscreen
// Blockly is mounted (with the domain blocks and their generators registered
// through the `blocks` prop) and reused for every file: load the file's JSON,
// then generate. The runtime provider owns this and calls `generate` in the
// source transform before compiling.
//
// THE FILE IS LOADED INTO A HEADLESS WORKSPACE, not the mounted one. Building
// the blocks is a fifth of the cost of building them WITH their SVG, and
// nothing here looks at a pixel: measured on the stock rules, loading
// `solid.rule` (409 blocks) took 178ms rendered against 29ms headless, and
// `gravity.rule` 93ms against 20ms. Generation runs on every edit to a file, so
// that is 150ms off each keystroke in the heaviest rule.
//
// The mounted workspace stays, and stays empty: it is what registers the blocks
// and hands back the generator, and an empty injected workspace costs nothing.

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
  {
    onReady?: () => void;
    projectRules?: readonly RuleMeta[];
    ownProperties?: readonly OwnMeta[];
    /**
     * The project's Blockly files, by path — read only to find block types
     * nothing defines any more, so a file holding one can still be loaded
     * (blockly/standInBlocks).
     */
    blocklyFiles?: Record<string, string>;
  }
>(function BlocklyGenerator(
  {onReady, projectRules, ownProperties, blocklyFiles},
  ref,
) {
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const generatorRef: MutableRefObject<JavascriptGenerator | null> =
    useRef(null);
  /**
   * Where files are actually loaded — no SVG, no renderer, no measuring text.
   *
   * Made once and cleared between files rather than made per file: a workspace
   * carries the variable map and the block registry lookups, and disposing one
   * per generate would pay for that again every time.
   */
  const headlessRef = useRef<Blockly.Workspace | null>(null);

  // The palette + root-block types for this project: the built-ins extended with
  // the project's own `.rule` rules. Setting `blocks` re-registers on the live
  // workspace (Driver.blocks), so the generator knows a project rule's blocks.
  const {blocks, rootTypes, worldEventTypes} = useMemo(() => {
    // Every rule's own read-only setters: this palette generates ALL of the
    // project's Blockly files, so it cannot be scoped to one `.rule` the way the
    // editor's is. It is never shown, so the extra blocks cost nothing.
    const palette = buildDomainPalette(projectRules ?? [], {
      allRuleModules: true,
      ownProperties: ownProperties ?? [],
    });
    // …and a stand-in for every type the project's files hold that this
    // palette does not mint — what a deleted rule leaves behind. The EDITOR
    // needs them so the file opens (BlocklyFileEditor); this needs them for
    // the same reason one file down: `generate` loads the file into a headless
    // workspace, and Blockly refuses a type it does not know, so one dead
    // reference would fail the generation of the file it sits in.
    const known = new Set(palette.blocks.map(block => block.type));
    return {
      ...palette,
      blocks: [
        ...palette.blocks,
        ...standInBlocks(Object.values(blocklyFiles ?? {}), known),
      ],
    };
  }, [projectRules, ownProperties, blocklyFiles]);
  // `generate` is a stable closure; read the current root types through a ref.
  const rootTypesRef = useRef(rootTypes);
  rootTypesRef.current = rootTypes;
  // Which hats register on the world rather than on an actor — the two go on
  // opposite sides of the world block (`assembleWorldModule`).
  const worldEventsRef = useRef(worldEventTypes);
  worldEventsRef.current = worldEventTypes;

  useImperativeHandle(
    ref,
    () => ({
      generate(contents, path) {
        const generator = generatorRef.current;
        if (!workspaceRef.current || !generator) {
          throw new Error('Blockly generator is not ready');
        }
        const workspace = (headlessRef.current ??= new Blockly.Workspace());
        // Tag this workspace so a renderer-dependent mutator (the params
        // `+`/`−`) skips its visual rebuild here — it has no renderer to draw
        // with, and only the serialized state / generated body is read. Set on
        // every call, before any block loads.
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
        generator.addReservedWords('actor,camera,world,eventValue,delta');
        generator.init(workspace);

        // A `.rule` file: the declarative scaffolding comes from its metadata
        // (parsed statically), but each action/query has an imperative body that
        // IS real code, generated from its `do` blocks here. `__ruleModule` marks
        // this module so a body referencing the rule's own member uses the local
        // `export const`, not an import of the module into itself.
        // Every top block: the rule root, and each `define trait` root beside
        // it (a trait's members chain below it, not inside the rule).
        const topBlocks = workspace.getTopBlocks(true);
        // What this file compiles to, decided by its NAME — a file's kind is a
        // property of the file, and no block may change it. Throws if one that
        // would is present (`fileKind`).
        const shape = moduleShape(
          path,
          topBlocks.map(block => block.type),
        );
        if (shape === 'rule') {
          // `.behavior` too, or a behavior reading its OWN state imports the
          // module it is being written into and esbuild refuses the duplicate
          // symbol (specs/BEHAVIORS.md).
          const modulePath = (path ?? '').replace(/\.(rule|behavior)$/, '');
          const meta = parseRuleMeta(modulePath, contents);
          if (!meta) {
            return generator.finish('export {};\n');
          }
          (generator as {__ruleModule?: string}).__ruleModule = modulePath;
          const bodies = extractRuleBodies(topBlocks, {
            body: block =>
              generator.statementToCode(block as Blockly.Block, 'DO'),
            // A step's body is what follows the hat. `blockToCode` on the next
            // block generates it and everything chained after it.
            chainBody: block => {
              const first = (block as Blockly.Block).getNextBlock();
              if (!first) {
                return '';
              }
              const code = generator.blockToCode(first);
              return Array.isArray(code) ? code[0] : code;
            },
            // The params mutator stores each param's variable id in extraState;
            // map them to the safe JS identifiers the body's getters resolve to,
            // so the closure signature and the getters agree.
            signature: block => {
              const state = (
                block as {
                  saveExtraState?: () => {
                    parts?: Array<{kind?: string; var?: string}>;
                  };
                }
              ).saveExtraState?.();
              // `define block` keeps the whole designed signature; the closure's
              // parameters are its `param` parts, in order.
              const vars = (state?.parts ?? [])
                .filter(part => part.kind === 'param')
                .map(part => part.var ?? '');
              return vars.map(id => generator.getVariableName(id));
            },
          });
          (generator as {__ruleModule?: string}).__ruleModule = undefined;
          // What the bodies imported, so the declarations do not import it
          // again — `finish` prepends these, and two imports of one name is a
          // build failure rather than a redundancy (ruleMetaToModule).
          const imported = new Set(
            Object.keys(
              (generator as unknown as {definitions_?: Record<string, string>})
                .definitions_ ?? {},
            ),
          );
          return generator.finish(ruleMetaToModule(meta, bodies, imported));
        }

        // A root block (an event handler, or an actor/world definition)
        // owns the blocks chained below it as its body and generates that chain
        // itself — so generate it `thisOnly` to stop `scrub_` from also appending
        // the chain after it.
        // An `.actor` file's own properties. `__ruleModule` marks this module
        // for `refCode` the same way a `.rule`'s does: a get/set block here
        // names the local const rather than importing the module into itself,
        // which is the only sensible reading when the property's whole scope is
        // this file.
        const ownActor =
          shape === 'actor' && path
            ? parseActorOwnMeta(path.replace(/\.actor$/, ''), contents)
            : undefined;
        // …and a WORLD's own, which are the same declaration one scope up
        // (specs/WORLD_STATE.md). `__ruleModule` for the same reason: a get
        // block in this file names the local const rather than importing the
        // module into itself.
        const ownWorld =
          shape === 'world' && path
            ? parseWorldOwnMeta(path.replace(/\.world$/, ''), contents)
            : undefined;
        const owning = ownActor ?? ownWorld;
        if (owning) {
          (generator as {__ruleModule?: string}).__ruleModule =
            owning.modulePath;
        }
        // The world block emits these itself, right after `const world` and
        // before its body — the body is what reads them (`world_world`).
        (generator as {__worldOwn?: string}).__worldOwn = ownWorld
          ? worldOwnPropertyDeclarations(ownWorld)
          : '';

        const generated = workspace.getTopBlocks(true).map(block => ({
          type: block.type,
          code: asString(
            generator.blockToCode(block, rootTypesRef.current.has(block.type)),
          ),
        }));
        return generator.finish(
          shape === 'world'
            ? assembleWorldModule(generated, worldEventsRef.current)
            : assembleActorModule(
                generated,
                ownActor ? ownPropertyDeclarations(ownActor) : '',
              ),
        );
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
