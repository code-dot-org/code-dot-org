import {cleanup, render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {afterEach, describe, expect, it, vi} from 'vitest';

import RectangleInputPlugin from '../../../inputs/rectangle';
import TriangleInputPlugin from '../../../inputs/triangle';
import {defaultTheme, highContrastTheme} from '../../../themes';
import type {BlockDefinitions, BlocklySerialization} from '../../../types';

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

  // An input plugin supplied via the `plugins` prop binds a notch shape to a
  // type string. A block then only names that type (`output: 'Number'`); the
  // shape is applied to its connection by the renderer. This checks the plugin
  // is registered into the injected renderer and that the type string resolves
  // to the plugin's shape.
  it('applies an input-plugin shape, supplied via plugins, to a typed output', async () => {
    const TYPED_BLOCK: BlockDefinitions = [
      {
        type: 'test_rectangle_output',
        style: 'math_blocks',
        tooltip: '',
        helpUrl: '',
        output: 'Number',
        message0: 'number %1',
        args0: [{type: 'field_number', name: 'NUM', value: 1}],
        generator: {javascript: () => '1'},
      },
    ];
    const workspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };

    render(
      <BlocklyWorkspace
        blocks={TYPED_BLOCK}
        plugins={[RectangleInputPlugin('Number')]}
        startBlocks={{
          blocks: {blocks: [{type: 'test_rectangle_output'}]},
        }}
        workspaceRef={workspaceRef}
      />,
    );

    await vi.waitFor(
      () => {
        const workspace = workspaceRef.current;
        expect(workspace).not.toBeNull();
        const constants = workspace!.getRenderer().getConstants();
        // The plugin registers its shape into the injected renderer's SHAPES.
        const shapes = constants.SHAPES as Record<string, number>;
        expect(shapes.RECTANGLE).toBeDefined();
        // ...and the block's `output: 'Number'` connection resolves to it.
        const block = workspace!.getAllBlocks(false)[0];
        expect(block).toBeDefined();
        const shape = constants.shapeFor(
          block.outputConnection as Blockly.RenderedConnection,
        );
        expect(shape.type).toBe(shapes.RECTANGLE);
      },
      {timeout: 5000, interval: 50},
    );
  });

  // Two workspaces alive at once, each binding a *different* shape to the same
  // type string. Each must keep its own shape: the renderer is registered per
  // workspace under a unique name, so neither overwrites the other in Blockly's
  // process-global renderer registry.
  it('isolates input-plugin shapes between concurrent workspaces', async () => {
    const rectRef: {current: Blockly.WorkspaceSvg | null} = {current: null};
    const triRef: {current: Blockly.WorkspaceSvg | null} = {current: null};

    render(
      <>
        <BlocklyWorkspace
          plugins={[RectangleInputPlugin('Number')]}
          workspaceRef={rectRef}
        />
        <BlocklyWorkspace
          plugins={[TriangleInputPlugin('Number')]}
          workspaceRef={triRef}
        />
      </>,
    );

    await vi.waitFor(
      () => {
        expect(rectRef.current).not.toBeNull();
        expect(triRef.current).not.toBeNull();
        const rect = rectRef.current!.getRenderer().getConstants()
          .SHAPES as Record<string, number>;
        const tri = triRef.current!.getRenderer().getConstants()
          .SHAPES as Record<string, number>;
        // Each workspace carries only the shape it was given; neither leaks into
        // the other.
        expect(rect.RECTANGLE).toBeDefined();
        expect(rect.TRIANGLE).toBeUndefined();
        expect(tri.TRIANGLE).toBeDefined();
        expect(tri.RECTANGLE).toBeUndefined();
      },
      {timeout: 5000, interval: 50},
    );
  });

  // Switching to a theme with a larger font must grow the blocks to fit. Blockly
  // refreshes only block colours on a theme change, not their layout, so without
  // an explicit re-render the text would overflow a block kept at its old size.
  it('re-lays-out blocks when the theme increases the font size', async () => {
    const workspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };
    const startBlocks: BlocklySerialization = {
      blocks: {
        blocks: [
          {
            type: 'text_print',
            inputs: {
              TEXT: {shadow: {type: 'text', fields: {TEXT: 'Hello world'}}},
            },
          },
        ],
      },
    };

    const blockHeight = () =>
      (
        workspaceRef.current!.getAllBlocks(false)[0] as Blockly.BlockSvg
      ).getHeightWidth().height;

    const {rerender} = render(
      <BlocklyWorkspace
        startBlocks={startBlocks}
        theme={defaultTheme}
        workspaceRef={workspaceRef}
      />,
    );

    let defaultHeight = 0;
    await vi.waitFor(
      () => {
        expect(workspaceRef.current).not.toBeNull();
        expect(workspaceRef.current!.getAllBlocks(false)[0]).toBeDefined();
        defaultHeight = blockHeight();
        expect(defaultHeight).toBeGreaterThan(0);
      },
      {timeout: 5000, interval: 50},
    );

    rerender(
      <BlocklyWorkspace
        startBlocks={startBlocks}
        theme={highContrastTheme}
        workspaceRef={workspaceRef}
      />,
    );

    await vi.waitFor(
      () => {
        // The larger high-contrast font (16 vs 11) makes the block taller.
        expect(blockHeight()).toBeGreaterThan(defaultHeight);
      },
      {timeout: 5000, interval: 50},
    );
  });
});
