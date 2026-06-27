import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import type {BlocklySerialization} from '../../../types';

import BlocklyWorkspace from '../index';

/*
 * Browser-mode tests: Blockly injects a real <svg> and lays blocks out using
 * geometry (getBBox/getHeightWidth) that jsdom cannot provide, so these run in
 * a headless Chromium via vitest.browser.config.ts. They assert the rendering
 * path the jsdom round-trip tests cannot reach — that a workspace actually
 * mounts and draws the blocks it is given.
 */

afterEach(cleanup);

// A print block fed by a text shadow; both render visible SVG text.
const START_BLOCKS: BlocklySerialization = {
  blocks: {
    blocks: [
      {
        type: 'text_print',
        inputs: {
          TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hello'}}},
        },
      },
    ],
  },
};

describe('BlocklyWorkspace', () => {
  it('injects a Blockly workspace into the DOM', async () => {
    const {container} = render(<BlocklyWorkspace />);
    await vi.waitFor(
      () => expect(container.querySelector('svg.blocklySvg')).not.toBeNull(),
      {timeout: 5000, interval: 50},
    );
  });

  it('renders the blocks it is given', async () => {
    const {container} = render(<BlocklyWorkspace startBlocks={START_BLOCKS} />);
    await vi.waitFor(
      () => {
        const svg = container.querySelector('svg.blocklySvg');
        expect(svg).not.toBeNull();
        // a drawn block produces a draggable group with a rendered path...
        expect(svg?.querySelector('.blocklyDraggable')).not.toBeNull();
        // ...and the shadow's field text is drawn as SVG text
        expect(svg?.textContent).toContain('Hello');
      },
      {timeout: 5000, interval: 50},
    );
  });
});
