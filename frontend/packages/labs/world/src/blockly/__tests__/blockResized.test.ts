// A resize without an edit reaches the layout of its own workspace only.

import {describe, expect, it, vi} from 'vitest';

import {Blockly} from '@code-dot-org/blockly';

import {blockResized, onBlockResized} from '../blockResized';

describe('blockResized', () => {
  it("lays out the block's own workspace, and no other", () => {
    const laidOut = new Blockly.Workspace();
    const other = new Blockly.Workspace();
    const layOut = vi.fn();
    onBlockResized(laidOut, layOut);

    blockResized({workspace: other});
    expect(layOut).not.toHaveBeenCalled();

    blockResized({workspace: laidOut});
    expect(layOut).toHaveBeenCalledTimes(1);
  });
});
