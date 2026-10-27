// A rule as data compiles to what its blocks did (specs/RULE_EDITOR_PLAN.md,
// step 1).
//
// The compiler folds what it is handed back to data (`generateRule`), so a
// stock rule as data and as its view have to be the same program, body for
// body.

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {beforeAll, describe, expect, it} from 'vitest';

import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../../blockly/BlocklyGenerator';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {registerProjectRules} from '../../blockly/ruleRegistry';
import {ruleViewOf} from '../ruleData';

import {ALL_STOCK_SOURCES} from './support/compileStockRules';

/** Each rule's code, from its blocks and from its data's view. */
const generated = new Map<string, {blocks: string; data: string}>();

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
    generated.set(path, {
      blocks: generator.current!.generate(ruleViewOf(contents), `${path}.rule`),
      data: generator.current!.generate(contents, `${path}.rule`),
    });
  }
});

describe('every stock rule, as data', () => {
  it.each(Object.keys(ALL_STOCK_SOURCES))(
    '%s generates the same code',
    path => {
      const {blocks, data} = generated.get(path)!;
      expect(blocks).toContain('export');
      expect(data).toBe(blocks);
    },
  );
});
