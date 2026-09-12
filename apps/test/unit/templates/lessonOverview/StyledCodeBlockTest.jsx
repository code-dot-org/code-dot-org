import {Markdown} from '@code-dot-org/markdown';
import {render, screen} from '@testing-library/react';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import StyledCodeBlock, {
  buildProgrammingExpressionMarkdown,
} from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

describe('StyledCodeBlock', () => {
  describe('buildProgrammingExpressionMarkdown', () => {
    it('builds a full visual code block markdown expression', () => {
      const input = {
        color: '#c0ffee',
        link: 'https://example.com',
        syntax: 'test_block(x,y)',
      };
      const expected = '[`test_block(x,y)`(#c0ffee)](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).toBe(expected);
    });

    it('builds a regular code block when not given a color', () => {
      const input = {
        link: 'https://example.com',
        syntax: 'test_block(x,y)',
      };
      const expected = '[`test_block(x,y)`](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).toBe(expected);
    });
  });

  it('build full block markdown when color supplied', () => {
    const wrapper = shallow(
      <StyledCodeBlock
        programmingExpression={{
          syntax: 'playSound',
          color: '#000000',
          link: '/docs/applab/playSound',
        }}
      />
    );

    expect(wrapper.find(Markdown).props().content).toBe(
      '[`playSound`(#000000)](/docs/applab/playSound)'
    );
  });

  it('build regular code markdown when no color supplied', () => {
    const wrapper = shallow(
      <StyledCodeBlock
        programmingExpression={{
          syntax: 'playSound',
          color: null,
          link: '/docs/applab/playSound',
        }}
      />
    );

    expect(wrapper.find(Markdown).props().content).toBe(
      '[`playSound`](/docs/applab/playSound)'
    );
  });

  it('renders the color the visualCodeBlock extension applies', () => {
    // The markdown alone proves nothing: without that extension enabled the
    // `(#000000)` marker renders as literal text and the block has no color.
    render(
      <StyledCodeBlock
        programmingExpression={{
          syntax: 'playSound',
          color: '#000000',
          link: '/docs/applab/playSound',
        }}
      />
    );

    const link = screen.getByRole('link');
    expect(link.getAttribute('href')).toBe('/docs/applab/playSound');

    const code = link.querySelector('code');
    expect(code.textContent).toBe('playSound');
    expect(code.style.backgroundColor).toBe('rgb(0, 0, 0)');
    expect(screen.queryByText(/#000000/)).toBeNull();
  });

  it('embeds block if blockName is provided', () => {
    const wrapper = shallow(
      <StyledCodeBlock
        programmingExpression={{
          syntax: 'playSound',
          color: null,
          link: '/docs/spritelab/playSound',
          blockName: 'playSound',
        }}
      />
    );

    const blockLink = wrapper.find('EmbeddedBlock');
    expect(blockLink.props().link).toBe('/docs/spritelab/playSound');
    expect(blockLink.props().blockName).toBe('playSound');
  });
});
