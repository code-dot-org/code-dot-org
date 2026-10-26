// Can the head of a body surface actually hold the body?
//
// The surface hangs a member's implementation off the head's `next`, whatever
// input the FILE keeps it in (`bodySurfaces.bodyOf`). That is a claim about
// the head's CONNECTIONS, and nothing else in the lab checks it: `bodySurfaces`
// is pure serialization and never meets a block, and the palette is built
// without ever loading a surface into it. The gap between them is where this
// lives — and what fell into it was `each frame` in an `.actor` file, whose
// body surface threw out of Blockly's deserializer before a single block
// rendered.
//
// THAT PARTICULAR BLOCK CHAINS NOW (`domainBlocks.worldTraitStep`), so the
// palette can no longer produce a rootless head on its own. The guard stays
// and so does this, because what it protects is not a fact about one block: a
// member with a surface and no `next` is a body that cannot be opened, and
// there is nothing in a block definition that says so.

import {describe, expect, it} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {BODY_OWNER_ID, createBodySeam} from '../bodySurfaces';
import {buildDomainPalette} from '../domainBlocks';
import {bodySurfaceExtension} from '../extensions/bodyOwner';

/** An actor file holding one `each frame`, with one row in it. */
const actorFile = {
  blocks: {
    languageVersion: 0,
    blocks: [
      {
        type: 'world_trait_step',
        id: 'step1',
        fields: {PHASE: 'decide', NAME: 'climb with the arrow keys'},
        inputs: {DO: {block: {type: 'world_comment', id: 'row1'}}},
      },
    ],
  },
} as never;

describe('the head of a body surface', () => {
  it('is a row in an actor file, so it can hold a body of its own', () => {
    // What the incident cost: `each frame` shed BOTH connections in an
    // `.actor` file, because a definition root with a previous is an orphan to
    // `DisableOrphansPlugin` — and shedding the `next` is what left it unable
    // to head its own surface. It chains under `define actor` now, which is
    // the real fix; the extension below is the belt to its braces.
    const palette = buildDomainPalette([], {fileKind: 'actor'});
    const step = palette.blocks.find(
      block => block.type === 'world_trait_step',
    ) as {previousStatement?: unknown; nextStatement?: unknown} | undefined;

    expect(step).toBeDefined();
    expect(step?.previousStatement).toBe(true);
    expect(step?.nextStatement).toBe(true);
  });

  it('takes the body anyway, because the extension gives it a next', () => {
    // A HAND-BUILT ROOT, deliberately: the palette no longer makes one, and
    // the guard is for the member type that has a surface and no `next`
    // whatever the palette happens to be doing. The real definition also
    // carries two extensions that want a rendered workspace. What is being
    // checked here is the extension, not the palette.
    Blockly.Extensions.register(
      bodySurfaceExtension.name,
      bodySurfaceExtension.extension as never,
    );
    Blockly.defineBlocksWithJsonArray([
      {
        type: 'world_trait_step',
        message0: 'each frame %1',
        args0: [{type: 'input_statement', name: 'DO'}],
        extensions: [bodySurfaceExtension.name],
      },
      {
        type: 'world_comment',
        message0: 'note',
        previousStatement: null,
        nextStatement: null,
      },
    ]);

    const seam = createBodySeam();
    const surface = seam.bodyOf('step1', seam.show(actorFile));
    const workspace = new Blockly.Workspace();

    // BEFORE the load, not after: the connection is what the deserializer is
    // looking for while it attaches the body, so an extension that ran late
    // would still throw. Loading is the assertion.
    Blockly.serialization.workspaces.load(surface as never, workspace);

    const head = workspace.getBlockById(BODY_OWNER_ID);
    expect(head).not.toBeNull();
    expect(head?.getNextBlock()?.id).toBe('row1');
  });
});
