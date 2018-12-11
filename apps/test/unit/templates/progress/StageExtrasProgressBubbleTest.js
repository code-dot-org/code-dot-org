import { assert } from '../../../util/configuredChai';
import { stub } from 'sinon';
import React from 'react';
import { shallow } from 'enzyme';
import StageExtrasProgressBubble from '@cdo/apps/templates/progress/StageExtrasProgressBubble';
import * as utils from '@cdo/apps/utils';

const defaultProps = {
  stageExtrasUrl: '/extras',
  onStageExtras: false,
};

describe('StageExtrasProgressBubble', () => {
  beforeEach(() => {
    stub(utils, 'currentLocation').returns({search: ''});
  });

  afterEach(() => {
    utils.currentLocation.restore();
  });

  it('renders a link to given url', () => {
    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
      />
    );

    assert.equal(wrapper.props().href, '/extras');
  });

  it('preserves query params', () => {
    utils.currentLocation.restore();
    stub(utils, 'currentLocation').returns({search: '?foo=1'});

    const wrapper = shallow(
      <StageExtrasProgressBubble
        {...defaultProps}
      />
    );

    assert.equal(wrapper.props().href, '/extras?foo=1');
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
