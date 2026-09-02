// The generator's blocks are the generator's, whatever else is on screen.
//
// A block DEFINITION is global: `Blockly.Blocks` holds one per type, and the
// last palette registered speaks for the whole process. Two of this lab's
// definitions differ by file — `each frame` and `define drawing` are roots in
// an `.actor` file and chained rows everywhere else, because a top-level block
// with a previous connection is disabled as an orphan — so an OPEN ACTOR FILE
// leaves the process believing `each frame` cannot be chained.
//
// Which is what the headless generator then loaded every `.rule` against. It
// was refused the trait's own `each frame` ("the block is missing a previous
// connection"), so every rule in the project failed to generate — on any edit
// to an actor file, until another file was opened. It looked intermittent and
// was not: it was whoever registered last.
//
// THE ORDER IS THE TEST. The generator mounts first, as it does in the lab; the
// editor registers afterwards, as it does when a learner opens an actor; and
// then something generates.

import {render} from '@testing-library/react';
import {createRef} from 'react';
import {describe, expect, it} from 'vitest';

import {Blockly, BlocklyProvider} from '@code-dot-org/blockly';

import {expiresRule} from '../../rules/stock';
import BlocklyGenerator, {
  type BlocklyGeneratorHandle,
} from '../BlocklyGenerator';
import {buildDomainPalette} from '../domainBlocks';
import {parseRuleMeta} from '../ruleMeta';
import {registerProjectRules} from '../ruleRegistry';

const settle = () => new Promise(resolve => setTimeout(resolve, 50));

describe('generating while an actor file is open', () => {
  it('compiles a rule whose trait has an `each frame`', async () => {
    const meta = parseRuleMeta('rules/expires', expiresRule)!;
    registerProjectRules([meta]);
    const ref = createRef<BlocklyGeneratorHandle>();
    render(<BlocklyGenerator ref={ref} projectRules={[meta]} />);
    await settle();

    // …and now a learner opens an actor file, which registers the other shape.
    render(
      <BlocklyProvider
        blocks={buildDomainPalette([], {fileKind: 'actor'}).blocks}
      />,
    );
    await settle();

    const probe = new (
      Blockly as unknown as {
        Workspace: new () => {dispose(): void};
      }
    ).Workspace();
    const made = (
      Blockly as unknown as {
        Block: new (ws: unknown, type: string) => {previousConnection: unknown};
      }
    ).Block;
    const one = new made(probe, 'world_trait_step');
    expect(Boolean(one.previousConnection)).toBe(false);

    // The precondition, stated: what the process now believes `each frame` is
    // shaped like. Without it this test could pass because the editor's
    // palette never took effect, which is not the same as passing.
    const scratch = new Blockly.Workspace();
    const step = new Blockly.Block(scratch, 'world_trait_step');
    expect(Boolean(step.previousConnection)).toBe(false);

    const js = ref.current!.generate(expiresRule, 'rules/expires.rule');

    // The trait's step is IN the module: a refused block takes the file with
    // it, so the failure to catch is an empty module rather than a wrong one.
    // The trait's step, with its BODY in it. A refused block throws out of
    // `generate` — which is what the lab reported as "Blockly generation
    // failed" — so what this really asserts is that it did not.
    expect(js).toContain('addStep');
  });
});
