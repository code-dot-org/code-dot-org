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
  useBlocklyContext,
} from '@code-dot-org/blockly';

import {
  assembleActorModule,
  assembleMainMap,
  assembleMapModule,
  assembleWorldModule,
  type GeneratedBlock,
} from './assembleActorModule';
import styles from './blocklyGenerator.module.css';
import {buildDomainPalette, importVar, str} from './domainBlocks';
import {fileKindOf, moduleShape} from './fileKind';
import {mainMapLayersOf} from './mainMapLayers';
import {setCurrentPlacements} from './moduleOptions';
import {
  ownPropertyDeclarations,
  parseWorldOwnMeta,
  worldOwnPropertyDeclarations,
  parseActorOwnMeta,
  type OwnMeta,
} from './ownProperties';
import {parseMapManifest} from './ownProperties';
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

/** What a `.map` file holds that the generator reads (specs/MAP_FIRST.md). */
interface MapSource {
  actors?: Array<{id?: string; type?: string; blocks?: object}>;
  blocks?: object;
}

/** A workspace generated: its top blocks' code, keyed by the entry's id. */
type GeneratedWorkspaces = {
  placements: Array<{id: string; blocks: GeneratedBlock[]}>;
  mapLevel: GeneratedBlock[];
  /** The imports and variables every workspace here needed, merged. */
  definitions: Record<string, string>;
};

/** What the file is when its workspaces are taken out of it. */
const withoutBlocks = <T extends {blocks?: object}>(
  held: T,
): Omit<T, 'blocks'> => {
  const copy: Partial<T> = {...held};
  delete copy.blocks;
  return copy as Omit<T, 'blocks'>;
};

/**
 * Generate a map's workspaces — the map's own, then one per placement that
 * has one — into the same headless workspace in turn.
 *
 * `init` empties the generator's import definitions, so they are gathered
 * after each workspace and handed back for the caller to merge before the
 * one `finish`; Blockly's own `variables` entry is keyed per workspace so
 * one loop's variable does not erase another's. `__ruleModule` is the
 * owning module's path, so an `emit` of the map's own event names the local
 * const rather than importing the module into itself; `__mapModule` tells
 * `define event` to write that const (specs/MAP_SCRIPTS_PLAN.md). The
 * dropdown of placements is set first, since Blockly rejects a stored value
 * its options do not hold.
 */
function generateWorkspaces(
  generator: JavascriptGenerator,
  workspace: Blockly.Workspace,
  source: MapSource,
  modulePath: string,
  rootTypes: ReadonlySet<string>,
): GeneratedWorkspaces {
  const ids = (source.actors ?? []).flatMap(entry =>
    entry.id ? [entry.id] : [],
  );
  setCurrentPlacements(ids);
  const definitions: Record<string, string> = {};
  const asString = (code: string | [string, number]): string =>
    Array.isArray(code) ? code[0] : code;
  const generateOne = (state: object | undefined, key: string) => {
    if (!state) {
      return [];
    }
    workspace.clear();
    Blockly.serialization.workspaces.load(state, workspace);
    generator.init(workspace);
    (generator as {__ruleModule?: string}).__ruleModule = modulePath;
    (generator as {__mapModule?: string}).__mapModule = modulePath;
    const generated = workspace
      .getTopBlocks(true)
      .filter(block => block.isEnabled())
      .map(block => ({
        type: block.type,
        id: block.id,
        code: asString(generator.blockToCode(block, rootTypes.has(block.type))),
      }));
    const made = (
      generator as unknown as {definitions_: Record<string, string>}
    ).definitions_;
    for (const [name, code] of Object.entries(made)) {
      definitions[name === 'variables' ? `variables:${key}` : name] = code;
    }
    return generated;
  };
  const mapLevel = generateOne(source.blocks, 'map');
  const placements = (source.actors ?? []).flatMap(entry =>
    entry.id && entry.blocks
      ? [{id: entry.id, blocks: generateOne(entry.blocks, entry.id)}]
      : [],
  );
  (generator as {__mapModule?: string}).__mapModule = undefined;
  (generator as {__ruleModule?: string}).__ruleModule = undefined;
  return {placements, mapLevel, definitions};
}

/** Put the imports several workspaces needed back before `finish` reads them. */
const mergeDefinitions = (
  generator: JavascriptGenerator,
  definitions: Record<string, string>,
): void => {
  Object.assign(
    (generator as unknown as {definitions_: Record<string, string>})
      .definitions_,
    definitions,
  );
};

/**
 * Generate a `.map` file's module: one `finish` for the whole file, over the
 * workspaces it holds (specs/MAP_FIRST.md, "What it compiles to").
 */
function generateMap(
  generator: JavascriptGenerator,
  workspace: Blockly.Workspace,
  contents: string,
  path: string,
  rootTypes: ReadonlySet<string>,
): string {
  const modulePath = path.replace(/\.map$/, '');
  const source = (contents.trim() ? JSON.parse(contents) : {}) as MapSource;
  const {placements, mapLevel, definitions} = generateWorkspaces(
    generator,
    workspace,
    source,
    modulePath,
    rootTypes,
  );
  const data = withoutBlocks(source);
  const actors = (source.actors ?? []).map(withoutBlocks);
  // What the map's root says it is and what it says it raises, carried into
  // the data so that `World.loadMap` can check the second against what the
  // world declares (specs/MAP_EVENTS_PLAN.md). Absent when there is nothing
  // to say, so a map that raises nothing is the JSON it always was.
  const manifest = parseMapManifest(contents);
  generator.init(workspace);
  mergeDefinitions(generator, definitions);
  return generator.finish(
    assembleMapModule(
      {
        ...data,
        ...(manifest?.name ? {name: manifest.name} : {}),
        ...(manifest?.raises.length ? {raises: manifest.raises} : {}),
        actors,
      },
      mapLevel,
      placements,
    ),
  );
}

/**
 * A world's MAIN MAP, compiled for the world's module
 * (specs/MAIN_MAP_PLAN.md): the code `assembleWorldModule` emits after the
 * world block, and the imports it needs, which the caller merges once the
 * world's own workspace has been generated. Nothing for a world that holds
 * no map, or an empty one.
 */
function generateMainMap(
  generator: JavascriptGenerator,
  workspace: Blockly.Workspace,
  contents: string,
  path: string,
  rootTypes: ReadonlySet<string>,
): {code: string; definitions: Record<string, string>} | undefined {
  let source: MapSource | undefined;
  try {
    source = (JSON.parse(contents) as {map?: MapSource}).map;
  } catch {
    return undefined;
  }
  if (!source?.actors?.length) {
    return undefined;
  }
  const modulePath = path.replace(/\.world$/, '');
  const {placements, definitions} = generateWorkspaces(
    generator,
    workspace,
    source,
    modulePath,
    rootTypes,
  );
  // The kinds the map places, each imported and defined so `loadMap` can
  // make them — what the `load map` block does for a `.map` from the
  // registry, done here from the map itself.
  const kinds = [
    ...new Set(source.actors.flatMap(a => (a.type ? [a.type] : []))),
  ];
  for (const kind of kinds) {
    definitions[`mod:${kind}`] = `import ${importVar(kind)} from ${str(kind)};`;
  }
  const defines = kinds
    .map(kind => `world.define(${str(kind)}, ${importVar(kind)});\n`)
    .join('');
  const actors = source.actors.map(withoutBlocks);
  return {
    code: assembleMainMap(
      {...withoutBlocks(source), actors},
      placements,
      defines,
    ),
    definitions,
  };
}

export interface BlocklyGeneratorHandle {
  /**
   * Generate the JavaScript module for a Blockly file's JSON. `path` is the
   * file's project path — needed for a `.rule` (its module path names where its
   * own members are imported from, and marks self-references as local).
   */
  generate: (contents: string, path?: string) => string;
}

/** The half of the driver this needs: "register these definitions, now". */
interface DriverHandle {
  setBlocks: (blocks: unknown[]) => void;
}

/**
 * Hands the provider's driver up to the component that renders it.
 *
 * A provider's driver is only reachable from inside it, and `generate` is a
 * method on the component that renders one — so a child with no markup carries
 * it out. Nothing else in this file wants React context, which is why this is
 * three lines rather than a hook of its own.
 */
const CaptureDriver = ({
  into,
}: {
  into: MutableRefObject<DriverHandle | null>;
}) => {
  // The hook casts the context to whatever it is asked for, and what this
  // wants out of it is one method (`DriverHandle`).
  const {driver} = useBlocklyContext() as unknown as {
    driver?: {current?: DriverHandle};
  };
  into.current = driver?.current ?? null;
  return null;
};

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
  /**
   * This generator's own Blockly driver, captured from inside its provider.
   *
   * A BLOCK DEFINITION IS GLOBAL: `Blockly.Blocks` has one entry per type, and
   * the last palette registered wins. Two of them differ by file — `each
   * frame` and `define drawing` are roots in an `.actor` file and chained rows
   * everywhere else, because a top-level block with a previous connection is
   * disabled as an orphan (`DisableOrphansPlugin`) — so while an actor file was
   * the open editor, this generator loaded every `.rule` against a definition
   * with no previous connection and Blockly refused the trait's `each frame`:
   * "the block is missing a previous connection". Every rule in the project,
   * on any edit to an actor, until another file was opened.
   *
   * So the generator states its own definitions before it reads a file. It
   * cannot avoid the divergence — both shapes are wanted, in different files —
   * but it can stop depending on who registered last.
   */
  const driverRef = useRef<DriverHandle | null>(null);

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
        // Ours, not whoever's the open editor last registered (`driverRef`).
        driverRef.current?.setBlocks(blocks);
        const workspace = (headlessRef.current ??= new Blockly.Workspace());
        // Tag this workspace so a renderer-dependent mutator (the params
        // `+`/`−`) skips its visual rebuild here — it has no renderer to draw
        // with, and only the serialized state / generated body is read. Set on
        // every call, before any block loads.
        (workspace as {isRuleGenerator?: boolean}).isRuleGenerator = true;
        generator.addReservedWords(
          'actor,camera,world,eventValue,delta,map,placed,mapData',
        );
        // A `.map` is several workspaces in one JSON document, each generated
        // in turn there; everything else is one workspace and one shape.
        if (fileKindOf(path) === 'map') {
          return generateMap(
            generator,
            workspace,
            contents,
            path!,
            rootTypesRef.current,
          );
        }
        // A world's main map, generated FIRST: its placements' workspaces go
        // through the same headless workspace this file is about to be
        // loaded into (specs/MAIN_MAP_PLAN.md).
        const mainMap =
          fileKindOf(path) === 'world'
            ? generateMainMap(
                generator,
                workspace,
                contents,
                path!,
                rootTypesRef.current,
              )
            : undefined;
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
        generator.init(workspace);

        // A `.rule` file: the declarative scaffolding comes from its metadata
        // (parsed statically), but each action/query has an imperative body that
        // IS real code, generated from its `do` blocks here. `__ruleModule` marks
        // this module so a body referencing the rule's own member uses the local
        // `export const`, not an import of the module into itself.
        // Every top block: the rule root, and each `define trait` root beside
        // it (a trait's members chain below it, not inside the rule).
        // Disabled roots are not there: an orphan, or a definition the
        // misplaced-block plugin greyed out because this kind of file cannot
        // hold it (`misplacedBlocks`). Both generate nothing, and a greyed
        // `define actor` in a world must not stop the world compiling either.
        const topBlocks = workspace
          .getTopBlocks(true)
          .filter(block => block.isEnabled());
        // What this file compiles to, decided by its NAME — a file's kind is a
        // property of the file, and no block may change it. Throws if one that
        // would is present (`fileKind`).
        const shape = moduleShape(
          path,
          topBlocks.map(block => block.type),
        );
        if (shape === 'rule') {
          const modulePath = (path ?? '').replace(/\.rule$/, '');
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
        // …and the main map's LAYERS, which the world block declares with
        // its own (`mainMapLayers`). Cleared for every other kind of file.
        (generator as {__mainMapLayers?: unknown}).__mainMapLayers =
          shape === 'world' ? mainMapLayersOf(contents) : [];
        // …and the main map ITSELF, which the world block loads between its
        // prologue and its rows, so a row can name a placement
        // (specs/MAP_BEFORE_ROWS_PLAN.md).
        (generator as {__mainMap?: string}).__mainMap =
          shape === 'world' ? (mainMap?.code ?? '') : '';
        // The world block emits these itself, right after `const world` and
        // before its body — the body is what reads them (`world_world`).
        (generator as {__worldOwn?: string}).__worldOwn = ownWorld
          ? worldOwnPropertyDeclarations(ownWorld)
          : '';

        const generated = topBlocks.map(block => ({
          type: block.type,
          id: block.id,
          code: asString(
            generator.blockToCode(block, rootTypesRef.current.has(block.type)),
          ),
        }));
        if (mainMap) {
          mergeDefinitions(generator, mainMap.definitions);
        }
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
        <CaptureDriver into={driverRef} />
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
