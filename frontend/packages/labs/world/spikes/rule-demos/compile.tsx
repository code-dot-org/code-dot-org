// Compiling a stock `.rule` to JavaScript and running it, with no browser.
//
// The spike's foundation, and the part that was not obvious. A stock rule is
// Blockly JSON; the thing that turns it into a module is the headless
// generator, which needs a DOM — so this runs under vitest's jsdom rather than
// as a plain node script like the other spikes.
//
// The generated module is ESM that imports `world-lab` and its sibling rules by
// path. Rather than write a loader, each module is rewritten into a function
// body: the engine is injected, sibling imports are read out of the modules
// compiled before it, and the exports are collected on the way out. Fragile in
// the way a spike is allowed to be, and it buys the real rules running in a
// test — no reimplementation to drift from what ships.

import {render} from '@testing-library/react';
import {createRef} from 'react';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../src/blockly/BlocklyGenerator';
import {parseRuleMeta} from '../../src/blockly/ruleMeta';
import {registerProjectRules} from '../../src/blockly/ruleRegistry';
import * as WorldLab from '../../src/engine';

export type RuleModule = Record<string, unknown>;

/** Turn one generated module into a value, given the ones it imports. */
function evaluate(js: string, modules: Record<string, RuleModule>): RuleModule {
  const exported = [...js.matchAll(/^export const (\w+)/gm)].map(m => m[1]);
  const body = js
    // The engine, injected rather than imported. Both forms appear.
    .replace(/^import \* as WorldLab from ['"]world-lab['"];$/gm, '')
    .replace(
      /^import \{([^}]*)\} from ['"]world-lab['"];$/gm,
      'const {$1} = WorldLab;',
    )
    // Siblings, read out of what was compiled before this.
    .replace(
      /^import \{([^}]*)\} from ['"]([^'"]*)['"];$/gm,
      'const {$1} = __modules["$2"];',
    )
    .replace(
      /^import (\w+) from ['"]([^'"]*)['"];$/gm,
      'const $1 = __modules["$2"].default;',
    )
    .replace(/^export default (.*);$/m, '__exports.default = $1;')
    .replace(/^export const (\w+)/gm, 'const $1');
  const collect = exported
    .map(name => `__exports.${name} = ${name};`)
    .join('\n');
  return new Function(
    'WorldLab',
    '__modules',
    '__exports',
    `${body}\n${collect}\nreturn __exports;`,
  )(WorldLab, modules, {}) as RuleModule;
}

/**
 * Compile stock rules to modules, in the order given.
 *
 * The order IS the dependency order: a rule is evaluated against the ones
 * before it, so `rules/gravity` has to come after `rules/motion`.
 */
export async function compileRules(
  sources: Record<string, string>,
): Promise<Record<string, RuleModule>> {
  const metas = Object.entries(sources).map(
    ([path, contents]) => parseRuleMeta(path, contents)!,
  );
  registerProjectRules(metas);
  const ref = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={ref} projectRules={metas} />);
  await new Promise(resolve => setTimeout(resolve, 50));

  const modules: Record<string, RuleModule> = {};
  for (const [path, contents] of Object.entries(sources)) {
    const js = ref.current!.generate(contents, `${path}.rule`);
    if (process.env.DUMP === path) {
      // eslint-disable-next-line no-console
      console.log(js);
    }
    modules[path] = evaluate(js, modules);
  }
  return modules;
}
