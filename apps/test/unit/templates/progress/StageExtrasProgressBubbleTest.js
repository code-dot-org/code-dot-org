import {assert} from '../../../util/reconfiguredChai';
import {stub} from 'sinon';
import React from 'react';
import {shallow} from 'enzyme';
import StageExtrasProgressBubble from '@cdo/apps/templates/progress/StageExtrasProgressBubble';
import * as utils from '@cdo/apps/utils';
import color from '@cdo/apps/util/color';

const defaultProps = {
  stageExtrasUrl: '/extras',
  onStageExtras: false
};

describe('StageExtrasProgressBubble', () => {
  beforeEach(() => {
    stub(utils, 'currentLocation').returns({search: ''});
  });

  afterEach(() => {
    utils.currentLocation.restore();
  });

  it('renders a link to given url', () => {
    const wrapper = shallow(<StageExtrasProgressBubble {...defaultProps} />);

    assert.equal(wrapper.props().href, '/extras');
  });

  it('preserves query params', () => {
    utils.currentLocation.restore();
    stub(utils, 'currentLocation').returns({search: '?foo=1'});

    const wrapper = shallow(<StageExtrasProgressBubble {...defaultProps} />);

    assert.equal(wrapper.props().href, '/extras?foo=1');
  });

  it('has a grey flag icon when not current level', () => {
    const wrapper = shallow(<StageExtrasProgressBubble {...defaultProps} />);
    assert.equal(
      wrapper
        .find('i')
        .at(1)
        .props().style.color,
      color.lighter_gray
    );
  });

  it('has a green flag icon when on stage extras', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble {...defaultProps} onStageExtras={true} />
    );
    assert.equal(
      wrapper
        .find('i')
        .at(1)
        .props().style.color,
      color.level_perfect
    );
  });
});
