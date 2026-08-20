// Running the rules that actually ship, in a test.
//
// Nothing else in the suite does. The engine's tests use reimplementations
// (`engine/__tests__/fixtures/gravityRule` and friends) which are honest
// vehicles for engine machinery and are NOT the rules a learner imports; the
// rule tests parse a `.rule` and assert on its metadata, which says what a rule
// declares rather than what it does. So a rule could declare everything
// correctly, generate correct-looking code, and crash on its first frame —
// which is exactly what Steering did, through 2000 passing tests, until a spike
// ran it.
//
// This closes that gap. A stock rule is Blockly JSON; the headless generator
// turns it into a module, so this needs a DOM and runs under jsdom like any
// other component test.
//
// HOW THE MODULE IS LOADED, and what it costs. The generated module is ESM that
// imports `world-lab` and its sibling rules by path. Rather than stand up a
// loader, each is rewritten into a function body: the engine is injected,
// siblings are read from what was compiled before, and the exports are
// collected on the way out. That is a text transform over generated code, so it
// is tied to the shape the generator emits — a new import form would need a
// line here. The alternative was esbuild in the test path, which is the
// sandbox's job and a great deal more machinery for the same answer.
//
// The ORDER of `sources` is the dependency order: a rule is evaluated against
// the ones before it.

import {render} from '@testing-library/react';
import {createRef} from 'react';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../../blockly/BlocklyGenerator';
import {parseRuleMeta} from '../../../blockly/ruleMeta';
import {registerProjectRules} from '../../../blockly/ruleRegistry';
import * as WorldLab from '../../../engine';
import {
  arrowsRule,
  boundsRule,
  cameraConfinedRule,
  cameraDeadzoneRule,
  cameraEaseRule,
  cameraFollowRule,
  cameraRule,
  collectRule,
  collisionsRule,
  dragRule,
  driveRule,
  expiresRule,
  gravityRule,
  healthRule,
  inputRule,
  jumpRule,
  motionRule,
  mouseRule,
  patrolRule,
  scoreRule,
  shootsRule,
  solidRule,
  steeringRule,
  timeRule,
  wrapRule,
  writingRule,
} from '../../stock';

export type RuleModule = Record<string, unknown>;

/**
 * Turn one generated module into a value, given the ones it imports.
 *
 * Exported because compiling a whole PROJECT needs the same trick on `.actor`
 * and `.world` modules (`__tests__/support/compileProject`), and the rewrite
 * is tied to the shape the generator emits — one copy of that coupling is
 * enough.
 */
export function evaluate(
  js: string,
  modules: Record<string, RuleModule>,
): RuleModule {
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
    // `export {a, b};`, which a `.world` module emits for its local actors.
    // The comment above says a new form needs a line here; this is that line.
    .replace(/^export \{([^}]*)\};$/gm, (_, names: string) =>
      names
        .split(',')
        .map(name => name.trim())
        .filter(Boolean)
        .map(name => `__exports.${name} = ${name};`)
        .join('\n'),
    )
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
export async function compileStockRules(
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
    modules[path] = evaluate(
      ref.current!.generate(contents, `${path}.rule`),
      modules,
    );
  }
  return modules;
}

/**
 * Every stock rule, by the path a demo names it with, in DEPENDENCY ORDER.
 *
 * One list, shared by everything that compiles rules — the behaviour tests and
 * the demo recorder. Each kept its own until each in turn compiled a subset and
 * met "Cannot read properties of undefined" the moment a demo asked for a rule
 * that list had not heard of. Compiling one nobody wants costs milliseconds;
 * two lists cost that bug twice.
 */
export const ALL_STOCK_SOURCES: Record<string, string> = {
  'rules/motion': motionRule,
  'rules/collisions': collisionsRule,
  'rules/solid': solidRule,
  'rules/gravity': gravityRule,
  'rules/jump': jumpRule,
  'rules/steering': steeringRule,
  'rules/patrol': patrolRule,
  'rules/collect': collectRule,
  'rules/health': healthRule,
  'rules/time': timeRule,
  'rules/drag': dragRule,
  'rules/expires': expiresRule,
  'rules/wrap': wrapRule,
  'rules/bounds': boundsRule,
  'rules/shoots': shootsRule,
  'rules/input': inputRule,
  'rules/arrows': arrowsRule,
  'rules/drive': driveRule,
  'rules/mouse': mouseRule,
  'rules/writing': writingRule,
  'rules/score': scoreRule,
  'rules/camera': cameraRule,
  'rules/cameraFollow': cameraFollowRule,
  'rules/cameraEase': cameraEaseRule,
  'rules/cameraDeadzone': cameraDeadzoneRule,
  'rules/cameraConfined': cameraConfinedRule,
};
