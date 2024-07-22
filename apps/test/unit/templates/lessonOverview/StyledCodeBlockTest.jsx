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

    expect(wrapper.find('SafeMarkdown').props().markdown).toBe(
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

    expect(wrapper.find('SafeMarkdown').props().markdown).toBe(
      '[`playSound`](/docs/applab/playSound)'
    );
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
