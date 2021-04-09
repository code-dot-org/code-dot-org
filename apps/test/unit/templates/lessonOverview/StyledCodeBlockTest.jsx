import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StyledCodeBlock, {
  buildProgrammingExpressionMarkdown
} from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

describe('StyledCodeBlock', () => {
  describe('buildProgrammingExpressionMarkdown', () => {
    it('builds a full visual code block markdown expression', () => {
      const input = {
        color: '#c0ffee',
        link: 'https://example.com',
        name: 'test block'
      };
      const expected = '[`test block`(#c0ffee)](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).to.equal(expected);
    });

    it('builds a full visual code block markdown expression with parameters', () => {
      const input = {
        color: '#c0ffee',
        link: 'https://example.com',
        name: 'test block',
        parameters: ['x', 'y']
      };
      const expected = '[`test block(x, y)`(#c0ffee)](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).to.equal(expected);
    });

    it('builds a regular code block when not given a color', () => {
      const input = {
        link: 'https://example.com',
        name: 'test block'
      };
      const expected = '[`test block`](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).to.equal(expected);
    });
  });

  it('build full block markdown when color supplied', () => {
    const wrapper = shallow(
      <StyledCodeBlock
        programmingExpression={{
          name: 'playSound',
          color: '#000000',
          link: '/docs/applab/playSound'
        }}
      />
    );

    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal(
      '[`playSound`(#000000)](/docs/applab/playSound)'
    );
  });

  it('build regular code markdown when no color supplied', () => {
    const wrapper = shallow(
      <StyledCodeBlock
        programmingExpression={{
          name: 'playSound',
          color: null,
          link: '/docs/applab/playSound'
        }}
      />
    );

    expect(wrapper.find('SafeMarkdown').props().markdown).to.equal(
      '[`playSound`](/docs/applab/playSound)'
    );
  });
});
