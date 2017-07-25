import { assert } from '../../../util/configuredChai';
import React from 'react';
import { shallow } from 'enzyme';
import StageExtrasProgressBubble from '@cdo/apps/templates/progress/StageExtrasProgressBubble';

const defaultProps = {
  stageExtrasUrl: '/extras',
  onStageExtras: false,
};

describe('StageExtrasProgressBubble', () => {
  it('renders a link to given url', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
      />
    );

    assert.equal(wrapper.props().href, '/extras');
  });

  it('has a flag icon when not current level', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('FontAwesome').props().icon, 'flag');
  });

  it('has a checkered flag icon when not current level', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
        onStageExtras={true}
      />
    );
    assert.equal(wrapper.find('FontAwesome').props().icon, 'flag-checkered');
  });
});
