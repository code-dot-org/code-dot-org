import {extensions} from '@code-dot-org/markdown';
import {render, screen} from '@testing-library/react';
import React from 'react';

import BlocklyMarkdown from '@cdo/apps/templates/markdown/BlocklyMarkdown';

/*
 * BlocklyMarkdown renders level `long_instructions` and `authored_hints`, so the
 * cases below are drawn from what curriculum actually authored into those two
 * fields across the Blockly labs (maze, artist, bounce, playlab, ...). Roughly,
 * by share of levels using each: CRLF line endings and trailing-double-space
 * hard breaks, inline code, bold/italic, markdown images (plain and
 * `expandable`), bullet and ordered lists, embedded `<xml>` blocks, `---`
 * dividers, ATX and lenient (`###Text`) headings, and hand-written HTML —
 * `<div style>`, `<b>`, `<br/>`, `<hr/>`, `<img width>`, entities, `<details>`.
 *
 * These render through the *built* @code-dot-org/markdown package: apps
 * resolves the package's `require` condition, so this is the only place the CJS
 * dist gets exercised. The markdown package's own vitest suite runs against
 * src, so it cannot catch a packaging/interop regression -- e.g. a default
 * import of a design-system component resolving to a namespace object instead
 * of the component (see the `interop` note in that package's vite.config.ts).
 */

// The extension set MarkdownInstructions enables for the Blockly path. Kept in
// sync with `this.blocklyExtensions` there; module-level so the reference is
// stable across renders, as the Markdown processor memo expects.
const instructionExtensions = [
  extensions.expandableImages({onExpand: () => {}}),
  extensions.lenientHeadings,
  extensions.visualCodeBlock,
  extensions.inlineStyles,
  extensions.details,
];

const renderInstructions = markdown =>
  render(
    <BlocklyMarkdown content={markdown} extensions={instructionExtensions} />
  );

describe('BlocklyMarkdown', () => {
  describe('base element mappings', () => {
    it('renders --- as a design-system divider', () => {
      renderInstructions('above\n\n---\n\nbelow');

      // The DSCO Divider renders an <hr> (role separator) carrying its hashed
      // module class.
      expect(screen.getByRole('separator').className).toMatch(/divider/);
    });

    it('renders a link as a design-system link', () => {
      renderInstructions('[text](https://example.com)');

      const link = screen.getByRole('link', {name: 'text'});
      expect(link.getAttribute('href')).toBe('https://example.com');
      expect(link.className).toMatch(/link/);
    });

    it('renders bold, italic and inline code', () => {
      renderInstructions('Use **run** and *then* press `when run`.');

      expect(screen.getByText('run').tagName).toBe('STRONG');
      expect(screen.getByText('then').tagName).toBe('EM');
      expect(screen.getByText('when run').tagName).toBe('CODE');
    });

    it('renders ATX headings at their authored level', () => {
      renderInstructions('# Puzzle\n\n## Steps');

      expect(screen.getByRole('heading', {level: 1}).textContent).toBe(
        'Puzzle'
      );
      expect(screen.getByRole('heading', {level: 2}).textContent).toBe('Steps');
    });

    it('renders bullet and ordered lists', () => {
      renderInstructions('- one\n- two\n\n1. first\n2. second');

      expect(screen.getAllByRole('list')).toHaveLength(2);
      expect(
        screen.getAllByRole('listitem').map(item => item.textContent)
      ).toEqual(['one', 'two', 'first', 'second']);
    });

    /*
     * The shape that first surfaced the divider interop bug: CRLF line endings
     * (about half of all authored instructions) with trailing-double-space hard
     * breaks around a `---`.
     */
    it('handles CRLF line endings and trailing hard breaks', () => {
      renderInstructions(
        '**Free Play:** Get as much treasure as you can.  \r\n\r\n---\r\n\r\nDrag blocks into the workspace.  '
      );

      expect(screen.getByRole('separator')).toBeDefined();
      expect(screen.getByText('Free Play:').tagName).toBe('STRONG');
      expect(screen.getByText('Drag blocks into the workspace.')).toBeDefined();
    });
  });

  describe('hand-written HTML', () => {
    it('keeps a styled div wrapper with its inline formatting', () => {
      renderInstructions(
        '<div style="color: #7665a0; font-size: 1.6em;"><b>Free Play:</b><br/>Design a decoration.</div>'
      );

      const bold = screen.getByText('Free Play:');
      expect(bold.tagName).toBe('B');

      const wrapper = bold.closest('div[style]');
      expect(wrapper.style.color).toBe('rgb(118, 101, 160)');
      expect(wrapper.style.fontSize).toBe('1.6em');
      expect(wrapper.getElementsByTagName('br')).toHaveLength(1);
    });

    it('renders an <hr/> tag as the same design-system divider', () => {
      renderInstructions('above\n\n<hr/>\n\nbelow');

      expect(screen.getByRole('separator').className).toMatch(/divider/);
    });

    it('renders an <img> tag, keeping its sizing attribute', () => {
      renderInstructions(
        '<img src="https://images.code.org/x.png" alt="a napkin" width="200px"/>'
      );

      const image = screen.getByRole('img', {name: 'a napkin'});
      expect(image.getAttribute('src')).toBe('https://images.code.org/x.png');
      expect(image.getAttribute('width')).toBe('200px');
    });

    it('decodes HTML entities', () => {
      renderInstructions('Tom&rsquo;s &amp; Jerry&#39;s');

      expect(screen.getByText("Tom’s & Jerry's")).toBeDefined();
    });
  });

  describe('instruction extensions', () => {
    it('renders a plain markdown image', () => {
      renderInstructions('![a napkin](https://images.code.org/x.png)');

      expect(
        screen.getByRole('img', {name: 'a napkin'}).getAttribute('src')
      ).toBe('https://images.code.org/x.png');
    });

    it('renders an "expandable" image as an expand button', () => {
      renderInstructions(
        '![a napkin expandable](https://images.code.org/x.png)'
      );

      const trigger = screen.getByRole('button', {
        name: 'Expand image: a napkin',
      });
      expect(trigger.getElementsByTagName('img')).toHaveLength(1);
    });

    it('renders a lenient heading written without a space', () => {
      renderInstructions('###Need Ideas?');

      expect(screen.getByRole('heading', {level: 3}).textContent).toBe(
        'Need Ideas?'
      );
    });

    it('colors a visual code block from its hex suffix', () => {
      renderInstructions('Drag `move forward`(#00b23b) into the workspace.');

      const code = screen.getByText('move forward');
      expect(code.tagName).toBe('CODE');
      expect(code.style.backgroundColor).toBe('rgb(0, 178, 59)');
    });

    it('renders a ::: details block as a disclosure', () => {
      renderInstructions(':::details [Need Ideas?]\nTry a tablecloth.\n:::');

      const summary = screen.getByText('Need Ideas?');
      expect(summary.tagName).toBe('SUMMARY');
      expect(summary.closest('details')).not.toBeNull();
      expect(screen.getByText('Try a tablecloth.')).toBeDefined();
    });
  });

  describe('embedded Blockly XML', () => {
    const BLOCK_XML =
      '<xml><block type="maze_moveForward"><title name="DIR">turnRight</title></block></xml>';

    let createEmbeddedWorkspace;

    beforeEach(() => {
      createEmbeddedWorkspace = jest.fn(() => ({dispose: () => {}}));
      global.Blockly = {
        createEmbeddedWorkspace,
        getMainWorkspace: () => undefined,
      };
    });

    afterEach(() => {
      delete global.Blockly;
    });

    it('builds a workspace from the blocks React rendered', () => {
      render(<BlocklyMarkdown content={`Try this:\n\n${BLOCK_XML}`} />);

      expect(createEmbeddedWorkspace).toHaveBeenCalledTimes(1);
      const [host, xml, options] = createEmbeddedWorkspace.mock.calls[0];
      // Blockly injects into the sibling <span> and only reads the hidden <xml>,
      // so React stays the sole writer of the latter.
      expect(host.tagName).toBe('SPAN');
      expect(xml.tagName).toBe('XML');
      expect(xml.getElementsByTagName('block')[0].getAttribute('type')).toBe(
        'maze_moveForward'
      );
      expect(options.rtl).toBe(false);
    });

    it('passes reading direction through to the workspace', () => {
      render(<BlocklyMarkdown content={BLOCK_XML} isRtl />);

      expect(createEmbeddedWorkspace.mock.calls[0][2].rtl).toBe(true);
    });

    it('holds creation until deferWorkspaceCreation runs the callback', () => {
      let create;
      const onWorkspaceRender = jest.fn();
      render(
        <BlocklyMarkdown
          content={BLOCK_XML}
          deferWorkspaceCreation={callback => (create = callback)}
          onWorkspaceRender={onWorkspaceRender}
        />
      );

      // MarkdownInstructions gates on the main block space existing; nothing may
      // be built before that gate opens.
      expect(createEmbeddedWorkspace).not.toHaveBeenCalled();

      create();
      expect(createEmbeddedWorkspace).toHaveBeenCalledTimes(1);
      expect(onWorkspaceRender).toHaveBeenCalledTimes(1);
    });
  });
});
