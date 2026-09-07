// The generator's blocks are the generator's, whatever else is on screen.
//
// A block DEFINITION is global: `Blockly.Blocks` holds one per type, and the
// last palette registered speaks for the whole process. So a block whose SHAPE
// depended on which file was open changed what every other file believed about
// it, and this test was written when that bit.
//
// The headless generator loaded every `.rule` against whatever the last palette
// said, and was refused the trait's own `each frame` ("the block is missing a
// previous connection"), so every rule in the project failed to generate — on
// any edit to an actor file, until another file was opened. It looked
// intermittent and was not: it was whoever registered last.
//
// BOTH BLOCKS THAT VARIED ARE ROWS NOW — `each frame`
// (`domainBlocks.worldTraitStep`) and `define drawing`
// (`worldDefineDrawing`) — so the hazard is gone by construction rather than
// avoided. What this pins is that: no type is minted in two shapes, whatever
// file the palette is built for. Reintroduce one and this fails before anybody
// meets the intermittent version of it.
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

    // The precondition, stated: the actor palette really did register, and
    // what it registered is what the process now holds. Without this the test
    // could pass because nothing took effect, which is not the same as
    // passing.
    const scratch = new Blockly.Workspace();
    for (const type of ['world_trait_step', 'world_define_drawing']) {
      const made = new Blockly.Block(scratch, type);
      expect(Boolean(made.previousConnection), type).toBe(true);
    }

    // …and no type at all is minted twice. The palette is built for each kind
    // of file in turn and asked what shape it gives every block; a type that
    // answers differently is a type whose definition depends on which file
    // happens to be open.
    const shapes = new Map<string, string>();
    for (const fileKind of ['actor', 'rule', 'world'] as const) {
      for (const block of buildDomainPalette([], {fileKind}).blocks) {
        const shape = JSON.stringify([
          Boolean((block as {previousStatement?: unknown}).previousStatement),
          Boolean((block as {nextStatement?: unknown}).nextStatement),
          (block as {output?: unknown}).output ?? null,
        ]);
        const seen = shapes.get(block.type);
        expect(seen ?? shape, `${block.type} in a .${fileKind}`).toBe(shape);
        shapes.set(block.type, shape);
      }
    }

    const js = ref.current!.generate(expiresRule, 'rules/expires.rule');

    // The trait's step is IN the module: a refused block takes the file with
    // it, so the failure to catch is an empty module rather than a wrong one.
    // The trait's step, with its BODY in it. A refused block throws out of
    // `generate` — which is what the lab reported as "Blockly generation
    // failed" — so what this really asserts is that it did not.
    expect(js).toContain('addStep');
  });
});
