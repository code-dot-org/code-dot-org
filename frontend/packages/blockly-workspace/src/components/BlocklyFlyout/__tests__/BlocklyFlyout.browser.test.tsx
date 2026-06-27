import {cleanup, render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {StrictMode} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {BlocklyProvider} from '../../../contexts/BlocklyContext';
import {defaultTheme, highContrastTheme} from '../../../themes';
import type {Theme} from '../../../types';
import type {BlocklyFlyoutProps} from '../index';
import BlocklyWorkspace from '../../BlocklyWorkspace';
import BlocklyFlyout from '../index';

/*
 * Browser-mode: the flyout creates a live Blockly workspace, lays out blocks,
 * and drives a real pointer-drag — all of which need true SVG geometry. These
 * run under StrictMode to mirror the demo (main.tsx renders under StrictMode);
 * the mount/unmount/mount cycle and the out-of-tree DOM position are what make
 * the component tricky. The flyout lives in its own container (external to the
 * workspace), as in real usage.
 */

afterEach(() => {
  cleanup();
  // The drag-ghost overlay lives on document.body (outside the React tree); make
  // sure a failed drag test doesn't leak one into the next.
  document
    .querySelectorAll('.blocklyFlyoutDragGhost')
    .forEach(ghost => ghost.remove());
});

// Render a flyout in its own container alongside a sized workspace.
function renderFlyout(
  props: BlocklyFlyoutProps,
  workspaceRef?: {current: Blockly.WorkspaceSvg | null},
): {container: HTMLElement} {
  return render(
    <StrictMode>
      <BlocklyProvider>
        <div style={{display: 'flex', width: 640, height: 480}}>
          <div style={{flex: '0 0 200px'}}>
            <BlocklyFlyout {...props} />
          </div>
          <div style={{flex: '1 1 auto'}}>
            <BlocklyWorkspace workspaceRef={workspaceRef} />
          </div>
        </div>
      </BlocklyProvider>
    </StrictMode>,
  ) as unknown as {container: HTMLElement};
}

describe('BlocklyFlyout', () => {
  it('supports keyboard navigation: focus, move, and place a block', async () => {
    // Keyboard parity with a real flyout via *real* keydown events (Blockly's own
    // keydown router is bound to the main injection div, which the external
    // flyout sits outside of, so the flyout forwards keydowns itself): focusing
    // the flyout then arrowing moves between blocks, and Enter places one.
    const flyoutWorkspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };
    const mainWorkspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };
    const {container} = renderFlyout(
      {
        blocks: [
          {kind: 'block', type: 'controls_if'},
          {kind: 'block', type: 'text'},
        ],
        workspaceRef: flyoutWorkspaceRef,
      },
      mainWorkspaceRef,
    );

    await vi.waitFor(
      () => {
        expect(flyoutWorkspaceRef.current?.getTopBlocks(false)).toHaveLength(2);
        expect(mainWorkspaceRef.current).not.toBeNull();
      },
      {timeout: 5000, interval: 50},
    );

    const flyoutWorkspace = flyoutWorkspaceRef.current!;
    const mainWorkspace = mainWorkspaceRef.current!;
    const blocks = flyoutWorkspace.getTopBlocks(true) as Blockly.BlockSvg[];
    const focusManager = Blockly.getFocusManager();
    const flyoutSvg = container.querySelector('.blocklyFlyout')!;
    // Blockly serializes shortcuts by keyCode, which the KeyboardEvent
    // constructor won't set; force it. ArrowDown = 40, Enter = 13.
    const press = (keyCode: number) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'keyCode', {value: keyCode});
      flyoutSvg.dispatchEvent(event);
    };

    // Blocks are keyboard-focusable.
    expect(blocks[0].canBeFocused()).toBe(true);

    // Tabbing in focuses the flyout workspace; arrowing down enters the first
    // block, then moves to the next.
    focusManager.focusNode(flyoutWorkspace);
    expect(focusManager.getFocusedNode()).toBe(flyoutWorkspace);
    press(40);
    await vi.waitFor(
      () => expect(focusManager.getFocusedNode()).toBe(blocks[0]),
      {timeout: 2000, interval: 30},
    );
    press(40);
    await vi.waitFor(
      () => expect(focusManager.getFocusedNode()).toBe(blocks[1]),
      {timeout: 2000, interval: 30},
    );

    // Enter places the focused block into the main workspace.
    expect(mainWorkspace.getAllBlocks(false)).toHaveLength(0);
    press(13);
    await vi.waitFor(
      () => expect(mainWorkspace.getAllBlocks(false)).toHaveLength(1),
      {timeout: 2000, interval: 30},
    );
  });

  it('renders its offered blocks, sized to content', async () => {
    const {container} = renderFlyout({
      blocks: [
        {kind: 'block', type: 'controls_if'},
        {kind: 'block', type: 'text'},
        {kind: 'block', type: 'math_number'},
      ],
    });

    await vi.waitFor(
      () => {
        const flyout = container.querySelector('.blocklyFlyout');
        expect(flyout).not.toBeNull();
        // Each offered block renders as a draggable group inside the flyout.
        expect(flyout!.querySelectorAll('.blocklyDraggable')).toHaveLength(3);
        // The flyout svg is sized to its content. A VerticalFlyout normally
        // takes its height from the target viewport; the inline flyout derives
        // it from content or it renders invisible.
        expect(Number(flyout!.getAttribute('height'))).toBeGreaterThan(0);
        // ...and the container takes that height too. Blockly styles the flyout
        // svg position:absolute, which would leave it out of flow and collapse
        // the container despite the svg itself having a height.
        const host = flyout!.parentElement!;
        expect(host.getBoundingClientRect().height).toBeGreaterThan(0);
      },
      {timeout: 5000, interval: 50},
    );
  });

  it('starts a drag gesture from a flyout block without crashing', async () => {
    // A gesture triggers Blockly's focus / injection-div lookups, which walk the
    // DOM up for an `injectionDiv` ancestor; for an external flyout that walk
    // runs off the top and throws ("getAttribute is not a function") unless the
    // container is tagged. Catch that regression.
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.message);
    window.addEventListener('error', onError);

    try {
      const {container} = renderFlyout({
        blocks: [{kind: 'block', type: 'controls_if'}],
      });

      let block: Element | null = null;
      await vi.waitFor(
        () => {
          block = container.querySelector('.blocklyFlyout .blocklyDraggable');
          expect(block).not.toBeNull();
        },
        {timeout: 5000, interval: 50},
      );

      const rect = block!.getBoundingClientRect();
      const at = {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        button: 0,
        clientX: rect.x + rect.width / 2,
        clientY: rect.y + rect.height / 2,
      };
      block!.dispatchEvent(new PointerEvent('pointerdown', at));
      block!.dispatchEvent(new PointerEvent('pointerup', at));

      await new Promise(resolve => setTimeout(resolve, 50));
      expect(errors.join('\n')).not.toMatch(/getAttribute is not a function/);
    } finally {
      window.removeEventListener('error', onError);
    }
  });

  it('shows a drag-ghost overlay that follows the pointer and clears on drop', async () => {
    // Cosmetic clone shown on a top-level overlay so the drag is visible while
    // the real block is still clipped to the canvas.
    const workspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };
    const {container} = renderFlyout(
      {blocks: [{kind: 'block', type: 'controls_if'}]},
      workspaceRef,
    );

    let block: Element | null = null;
    await vi.waitFor(
      () => {
        block = container.querySelector('.blocklyFlyout .blocklyDraggable');
        expect(block).not.toBeNull();
        expect(workspaceRef.current).not.toBeNull();
      },
      {timeout: 5000, interval: 50},
    );

    const from = block!.getBoundingClientRect();
    const to = workspaceRef.current!.getInjectionDiv().getBoundingClientRect();
    const base = {bubbles: true, cancelable: true, pointerId: 1, button: 0};
    const start = {
      clientX: from.x + from.width / 2,
      clientY: from.y + from.height / 2,
    };
    // Drop on the canvas (a valid target); dropping back on the flyout is a
    // separate, unrelated edge case.
    const drop = {clientX: to.x + to.width / 2, clientY: to.y + to.height / 2};

    // No ghost before a drag begins.
    expect(document.querySelector('.blocklyFlyoutDragGhost')).toBeNull();

    block!.dispatchEvent(new PointerEvent('pointerdown', {...base, ...start}));
    // A move past the click threshold reveals the ghost.
    document.dispatchEvent(new PointerEvent('pointermove', {...base, ...drop}));
    const ghost = document.querySelector('.blocklyFlyoutDragGhost');
    expect(ghost).not.toBeNull();

    // The ghost carries the workspace's renderer/theme classes, so Blockly's
    // scoped block CSS styles its labels — white fill and the workspace font,
    // matching the flyout (which gets the same scoping on its container).
    const ghostText = ghost!.querySelector('text');
    const originalText = block!.querySelector('text');
    expect(ghostText).not.toBeNull();
    expect(originalText).not.toBeNull();
    const ghostStyle = getComputedStyle(ghostText!);
    const originalStyle = getComputedStyle(originalText!);
    // Labels are white (the scoped `.blocklyText { fill: #fff }`), not the
    // default black an unscoped clone would show.
    expect(originalStyle.fill).toBe('rgb(255, 255, 255)');
    expect(ghostStyle.fill).toBe(originalStyle.fill);
    expect(ghostStyle.fontFamily).toBe(originalStyle.fontFamily);
    expect(ghostStyle.fontSize).toBe(originalStyle.fontSize);

    // The drop removes it.
    document.dispatchEvent(new PointerEvent('pointerup', {...base, ...drop}));
    expect(document.querySelector('.blocklyFlyoutDragGhost')).toBeNull();
  });

  it('restyles the flyout blocks when the theme changes', async () => {
    // The flyout is a separate workspace, so it must follow the driver's theme
    // change (driven here by the main workspace's theme prop).
    const view = (theme: Theme) => (
      <StrictMode>
        <BlocklyProvider theme={defaultTheme}>
          <div style={{display: 'flex', width: 640, height: 480}}>
            <div style={{flex: '0 0 200px'}}>
              <BlocklyFlyout blocks={[{kind: 'block', type: 'controls_if'}]} />
            </div>
            <div style={{flex: '1 1 auto'}}>
              <BlocklyWorkspace theme={theme} />
            </div>
          </div>
        </BlocklyProvider>
      </StrictMode>
    );
    const {container, rerender} = render(view(defaultTheme));

    const flyoutPathFill = () =>
      getComputedStyle(container.querySelector('.blocklyFlyout .blocklyPath')!)
        .fill;
    const flyoutFontSize = () =>
      getComputedStyle(container.querySelector('.blocklyFlyout text')!)
        .fontSize;

    let beforeFill = '';
    let beforeFontSize = '';
    await vi.waitFor(
      () => {
        expect(
          container.querySelector('.blocklyFlyout .blocklyPath'),
        ).not.toBeNull();
        expect(container.querySelector('.blocklyFlyout text')).not.toBeNull();
        beforeFill = flyoutPathFill();
        beforeFontSize = flyoutFontSize();
      },
      {timeout: 5000, interval: 50},
    );

    // Switch the workspace theme; the flyout's block colour and font (high
    // contrast bumps the font size) should both follow.
    rerender(view(highContrastTheme));
    await vi.waitFor(
      () => {
        expect(flyoutPathFill()).not.toBe(beforeFill);
        expect(flyoutFontSize()).not.toBe(beforeFontSize);
      },
      {timeout: 5000, interval: 50},
    );
  });

  it('drags a flyout block into the main workspace at the drop point', async () => {
    const errors: string[] = [];
    const onError = (event: ErrorEvent) => errors.push(event.message);
    window.addEventListener('error', onError);
    const workspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };

    try {
      const {container} = renderFlyout(
        {blocks: [{kind: 'block', type: 'controls_if'}]},
        workspaceRef,
      );

      let block: Element | null = null;
      await vi.waitFor(
        () => {
          block = container.querySelector('.blocklyFlyout .blocklyDraggable');
          expect(block).not.toBeNull();
          expect(workspaceRef.current).not.toBeNull();
        },
        {timeout: 5000, interval: 50},
      );

      const workspace = workspaceRef.current!;
      expect(workspace.getAllBlocks(false)).toHaveLength(0);

      // Drag from the flyout block to the centre of the main workspace.
      const from = block!.getBoundingClientRect();
      const to = workspace.getInjectionDiv().getBoundingClientRect();
      const base = {
        bubbles: true,
        cancelable: true,
        pointerId: 1,
        button: 0,
        isPrimary: true,
      };
      block!.dispatchEvent(
        new PointerEvent('pointerdown', {
          ...base,
          clientX: from.x + from.width / 2,
          clientY: from.y + from.height / 2,
        }),
      );
      const drop = {
        clientX: to.x + to.width / 2,
        clientY: to.y + to.height / 2,
      };
      document.dispatchEvent(
        new PointerEvent('pointermove', {...base, ...drop}),
      );
      document.dispatchEvent(new PointerEvent('pointerup', {...base, ...drop}));

      await vi.waitFor(
        () => expect(workspace.getAllBlocks(false)).toHaveLength(1),
        {timeout: 5000, interval: 50},
      );

      // The dragged block was created in the main workspace, placed where it was
      // dropped (not defaulted to the origin), and nothing threw.
      const created = workspace.getAllBlocks(false)[0] as Blockly.BlockSvg;
      const xy = created.getRelativeToSurfaceXY();
      expect(Math.abs(xy.x) + Math.abs(xy.y)).toBeGreaterThan(0);
      expect(errors.join('\n')).toBe('');
    } finally {
      window.removeEventListener('error', onError);
    }
  });
});
