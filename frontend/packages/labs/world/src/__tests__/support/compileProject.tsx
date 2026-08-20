// Running a whole PROJECT in a test — not reading it.
//
// `compileStockRules` closed this gap for rules: a rule could declare
// everything correctly and crash on its first frame, and only running one
// found it. A project has the same gap one level up. `shippedBlocks` checks
// that every block the starter names exists, and `constants.test` checks that
// the files which have to agree do — both are structural, and neither would
// notice a starter whose player cannot reach its own platform.
//
// That is not hypothetical: the Jumping rule shipped with a default that rose
// 89 pixels at a platform 96 above the floor, and the arithmetic was caught by
// hand rather than by anything here.
//
// WHAT IT DOES. Populates the registries the generator reads, turns every
// Blockly file into a module, wraps every data file (`.map`, `.anim`) as one,
// and evaluates them in dependency order — then hands back the world the
// `.world` module built.
//
// THE ORDER IS COMPUTED, not written down. Two lists of modules have already
// drifted apart twice in this package, each time presenting as "Cannot read
// properties of undefined"; the generated code says what it imports, so this
// reads that and sorts. A new file in the starter needs no edit here.

import {render} from '@testing-library/react';
import {createRef} from 'react';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../blockly/BlocklyGenerator';
import {fileKindOf} from '../../blockly/fileKind';
import {refreshProjectDropdowns} from '../../blockly/projectDropdowns';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {registerProjectRules} from '../../blockly/ruleRegistry';
import type {World, WorldBuilder} from '../../engine';
import {
  evaluate,
  type RuleModule,
} from '../../rules/__tests__/support/compileStockRules';

/** `actors/player.actor` → `actors/player`, which is how imports name it. */
const modulePath = (path: string) => path.replace(/\.[^./]+$/, '');

/** What a generated module imports, as module paths. */
const importsOf = (js: string): string[] =>
  [...js.matchAll(/^import (?:[^'"]*?) from ['"]([^'"]*)['"];$/gm)]
    .map(match => match[1])
    .filter(path => path !== 'world-lab');

/**
 * Order modules so every one comes after what it imports.
 *
 * A plain depth-first walk. A cycle would loop forever, and cannot happen: the
 * generator emits imports from a file's own references, and a project with a
 * circular reference does not compile in the sandbox either.
 */
function inDependencyOrder(code: Record<string, string>): string[] {
  const done = new Set<string>();
  const order: string[] = [];
  const visit = (path: string) => {
    if (done.has(path) || !(path in code)) {
      return;
    }
    done.add(path);
    importsOf(code[path]).forEach(visit);
    order.push(path);
  };
  Object.keys(code).forEach(visit);
  return order;
}

export interface CompiledProject {
  /** The world the `.world` module built, ticked but not yet run. */
  world: World;
  /** Every module by path, for reaching a rule's traits and properties. */
  modules: Record<string, RuleModule>;
}

/**
 * Compile a project's files and build its world.
 *
 * `files` is `projectFiles(project.source)` — the flattened, folder-prefixed
 * map the runtime generates from.
 */
export async function compileProject(
  files: Record<string, string>,
): Promise<CompiledProject> {
  // The registries the generator reads besides each file. Without them a
  // `load map` block emits no `world.define` lines at all, and the world
  // builds with nothing in it — silently, since an empty map is legal.
  refreshProjectDropdowns(files, [], {}, []);

  const metas = Object.entries(files)
    .filter(([path]) => path.endsWith('.rule'))
    .map(([path, contents]) => parseRuleMeta(modulePath(path), contents)!);
  registerProjectRules(metas);

  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} projectRules={metas} />);
  await new Promise(resolve => setTimeout(resolve, 50));

  // Blockly files become code; everything else is data, and becomes a module
  // whose default export is the parsed file. That is what the sandbox's
  // bundler does with them, minus the bundler.
  //
  // `fileKindOf` is the same test the runtime splits on (WorldRuntimeContext's
  // `isBlocklyPath`), so a new Blockly file kind is handled here by being
  // handled there.
  const code: Record<string, string> = {};
  const modules: Record<string, RuleModule> = {};
  for (const [path, contents] of Object.entries(files)) {
    if (fileKindOf(path) !== undefined) {
      code[modulePath(path)] = ref.current!.generate(contents, path);
    } else if (/\.(map|anim|sheet|effect)$/.test(path)) {
      modules[modulePath(path)] = {default: JSON.parse(contents)};
    }
  }

  for (const path of inDependencyOrder(code)) {
    modules[path] = evaluate(code[path], modules);
  }

  const built = Object.entries(modules).find(([path]) =>
    path.startsWith('worlds/'),
  );
  if (!built) {
    throw new Error('project has no world module');
  }
  // `getWorld()`, not `instantiate()`. The generated module calls `loadMap` at
  // the top level, which builds the world and memoises it; `instantiate()`
  // would hand back a FRESH one with nothing placed in it — which is exactly
  // what the first cut of this did, and what the "builds a world with its map
  // in it" test caught. It is also what the real driver calls
  // (sandbox/worldPreviewWorkerManager).
  return {
    world: (built[1].default as WorldBuilder).getWorld(),
    modules,
  };
}
