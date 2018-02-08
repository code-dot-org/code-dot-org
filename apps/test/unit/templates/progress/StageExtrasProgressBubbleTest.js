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

  it('has a grey flag icon when not current level', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
      />
    );
    assert.match(wrapper.find('a').props().style.backgroundImage, /flag_inactive.png/);
  });

  it('has a green flag icon when on stage extras', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
        onStageExtras={true}
      />
    );
    assert.match(wrapper.find('a').props().style.backgroundImage, /flag_active.png/);
  });
});
