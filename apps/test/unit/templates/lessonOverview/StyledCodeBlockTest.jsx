import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import StyledCodeBlock from '@cdo/apps/templates/lessonOverview/StyledCodeBlock';

describe('StyledCodeBlock', () => {
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
