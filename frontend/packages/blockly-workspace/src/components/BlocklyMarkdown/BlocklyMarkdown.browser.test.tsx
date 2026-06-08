import {cleanup, render} from '@testing-library/react';
import {afterEach, describe, expect, it, vi} from 'vitest';

import BlocklyMarkdown from './index';

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
});
