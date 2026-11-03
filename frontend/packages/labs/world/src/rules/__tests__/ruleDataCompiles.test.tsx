// Every stock rule compiles from its data (specs/RULE_EDITOR_PLAN.md, step 1).

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../blockly/BlocklyGenerator';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {registerProjectRules} from '../../blockly/ruleRegistry';

import {ALL_STOCK_SOURCES} from './support/compileStockRules';

/** Each rule's code, from its data. */
const generated = new Map<string, string>();

beforeAll(async () => {
  // Generated here, once: the generator is unmounted after the first test.
  const metas = Object.entries(ALL_STOCK_SOURCES).map(
    ([path, contents]) => parseRuleMeta(path, contents)!,
  );
  registerProjectRules(metas);
  const generator = createRef<BlocklyGeneratorHandle>();
  render(<BlocklyGenerator ref={generator} projectRules={metas} />);
  await new Promise(resolve => setTimeout(resolve, 50));
  for (const [path, contents] of Object.entries(ALL_STOCK_SOURCES)) {
    generated.set(path, generator.current!.generate(contents, `${path}.rule`));
  }
});

describe('every stock rule, as data', () => {
  it.each(Object.keys(ALL_STOCK_SOURCES))('%s generates a module', path => {
    // Not the empty module a file that is no rule compiles to.
    expect(generated.get(path)).toContain('export');
    expect(generated.get(path)).not.toBe('export {};\n');
  });
});
