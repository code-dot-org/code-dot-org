import {cleanup, render} from '@testing-library/react';
import * as Blockly from 'blockly/core';
import {StrictMode} from 'react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import {BlocklyProvider} from '../../../contexts/BlocklyContext';
import {defaultTheme, highContrastTheme} from '../../../themes';
import type {Theme} from '../../../types';
import BlocklyWorkspace from '../../BlocklyWorkspace';
import BlocklyMarkdown from '../index';

/*
 * End-to-end browser test: markdown with an embedded <xml> sequence should
 * render a live, inline Blockly workspace. This exercises the whole chain —
 * the blockly extension surviving sanitization, convertBlocklyXmlToJson, and
 * the inline workspace injecting and cloning its rendered SVG into the page.
 *
 * The fixture uses a nested <block> (not a <shadow>) for the value input, since
 * the offline converter only expands direct-child <block>s.
 */

afterEach(cleanup);

const MARKDOWN =
  'Drag this: ' +
  '<xml><block type="text_print">' +
  '<value name="TEXT"><block type="text"><title name="TEXT">hi</title></block></value>' +
  '</block></xml>' +
  ' into your program.';

describe('BlocklyMarkdown', () => {
  it('renders embedded <xml> as a live inline workspace', async () => {
    const {container} = render(<BlocklyMarkdown content={MARKDOWN} />);

    await vi.waitFor(
      () => {
        // the inline workspace clones its rendered SVG into the span
        const svg = container.querySelector('svg');
        expect(svg).not.toBeNull();
        // the print block and its text argument are drawn as SVG text
        expect(svg?.textContent).toContain('print');
        expect(svg?.textContent).toContain('hi');
      },
      {timeout: 5000, interval: 50},
    );

    // the surrounding prose still renders as markdown
    expect(container.textContent).toContain('Drag this:');
    expect(container.textContent).toContain('into your program.');
  });

  it('renders embedded <xml> as a draggable flyout and places a block via keyboard', async () => {
    // In `draggable` mode each <xml> becomes a BlocklyFlyout wired to the
    // enclosing provider's main workspace. Runs under StrictMode to match the
    // demo. (Drag mechanics are covered by BlocklyFlyout's own tests; here we use
    // the keyboard path to confirm the markdown→flyout→workspace wiring.)
    const mainWorkspaceRef: {current: Blockly.WorkspaceSvg | null} = {
      current: null,
    };
    const {container} = render(
      <StrictMode>
        <BlocklyProvider>
          <div style={{display: 'flex', width: 640, height: 480}}>
            <div style={{flex: '0 0 240px'}}>
              <BlocklyMarkdown draggable content={MARKDOWN} />
            </div>
            <div style={{flex: '1 1 auto'}}>
              <BlocklyWorkspace workspaceRef={mainWorkspaceRef} />
            </div>
          </div>
        </BlocklyProvider>
      </StrictMode>,
    );

    await vi.waitFor(
      () => {
        expect(
          container.querySelector('.blocklyFlyout .blocklyDraggable'),
        ).not.toBeNull();
        expect(mainWorkspaceRef.current).not.toBeNull();
      },
      {timeout: 5000, interval: 50},
    );

    const flyout = container.querySelector('.blocklyFlyout')!;
    const mainWorkspace = mainWorkspaceRef.current!;
    // Prose around the block still renders.
    expect(container.textContent).toContain('Drag this:');

    // Keyboard-place the embedded block: focus the flyout, arrow to the block,
    // press Enter. keyCode is forced (the constructor won't set it): down = 40,
    // Enter = 13.
    const workspaceEl = flyout.querySelector('.blocklyWorkspace') as SVGElement;
    (workspaceEl as unknown as HTMLElement).focus();
    const press = (keyCode: number) => {
      const event = new KeyboardEvent('keydown', {
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(event, 'keyCode', {value: keyCode});
      flyout.dispatchEvent(event);
    };
    expect(mainWorkspace.getAllBlocks(false)).toHaveLength(0);
    press(40);
    press(13);
    await vi.waitFor(
      () => expect(mainWorkspace.getAllBlocks(false).length).toBeGreaterThan(0),
      {timeout: 2000, interval: 30},
    );
  });

  it('renders inline draggable flyout with group role, not region', async () => {
    // Inline flyouts live inside prose; they must not produce a landmark entry.
    // A group + aria-label announces name and role on focus but stays out of
    // the screen-reader landmark navigation list (VoiceOver rotor, NVDA
    // elements list). If the role were "region", every <xml> snippet in the
    // same markdown document would add an identically-named "Block palette"
    // region — indistinguishable to AT users.
    const {container} = render(
      <StrictMode>
        <BlocklyProvider>
          <div style={{display: 'flex', width: 640, height: 480}}>
            <div style={{flex: '0 0 240px'}}>
              <BlocklyMarkdown draggable content={MARKDOWN} />
            </div>
            <div style={{flex: '1 1 auto'}}>
              <BlocklyWorkspace />
            </div>
          </div>
        </BlocklyProvider>
      </StrictMode>,
    );

    await vi.waitFor(
      () => {
        expect(
          container.querySelector('.blocklyFlyout .blocklyDraggable'),
        ).not.toBeNull();
      },
      {timeout: 5000, interval: 50},
    );

    // The flyout's own container div uses role="group", not role="region".
    // Note: Blockly core assigns role="region" to its internal workspace <g>
    // element; div[role="..."] discriminates that from the flyout container.
    expect(container.querySelector('div[role="region"]')).toBeNull();
    const group = container.querySelector('div[role="group"]');
    expect(group).not.toBeNull();
    expect(group!.getAttribute('aria-label')).toBe('Block palette');
  });

  it('restyles draggable flyout blocks when the theme changes', async () => {
    const view = (theme: Theme) => (
      <StrictMode>
        <BlocklyProvider theme={defaultTheme}>
          <div style={{display: 'flex', width: 640, height: 480}}>
            <div style={{flex: '0 0 240px'}}>
              <BlocklyMarkdown draggable content={MARKDOWN} theme={theme} />
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

    let before = '';
    await vi.waitFor(
      () => {
        expect(
          container.querySelector('.blocklyFlyout .blocklyPath'),
        ).not.toBeNull();
        before = flyoutPathFill();
      },
      {timeout: 5000, interval: 50},
    );

    // Switch the workspace theme; the flyout's blocks should follow.
    rerender(view(highContrastTheme));
    await vi.waitFor(() => expect(flyoutPathFill()).not.toBe(before), {
      timeout: 5000,
      interval: 50,
    });
  });
});
