import {renderToStaticMarkup} from 'react-dom/server';
import {describe, expect, it} from 'vitest';

import {Markdown} from '@code-dot-org/markdown';

import {blockly} from './blockly';

const render = (markdown: string, enabled: boolean) =>
  renderToStaticMarkup(
    <Markdown
      content={markdown}
      extensions={enabled ? [blockly] : undefined}
    />,
  );

describe('blockly markdown extension', () => {
  it('permits xml/block tags only when enabled', () => {
    const md = '<xml><block type="foo" id="bar"></block></xml>';

    const without = render(md, false);
    expect(without).not.toContain('<xml');
    expect(without).not.toContain('<block');

    const html = render(md, true);
    expect(html).toContain('<xml');
    expect(html).toContain('<block');
  });

  it('clears clobberPrefix so ids are not rewritten', () => {
    const html = render('<xml><block type="foo" id="bar"></block></xml>', true);
    expect(html).toContain('id="bar"');
    expect(html).not.toContain('user-content-');
  });
});
