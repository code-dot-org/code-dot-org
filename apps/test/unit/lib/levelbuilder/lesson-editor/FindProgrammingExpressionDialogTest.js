import {buildProgrammingExpressionMarkdown} from '@cdo/apps/lib/levelbuilder/lesson-editor/FindProgrammingExpressionDialog';

import {expect} from '../../../../util/reconfiguredChai';

describe('FindProgrammingExpressionDialog', () => {
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

    it('builds a regular code block when not given a color', () => {
      const input = {
        link: 'https://example.com',
        name: 'test block'
      };
      const expected = '[`test block`](https://example.com)';
      expect(buildProgrammingExpressionMarkdown(input)).to.equal(expected);
    });
  });
});
