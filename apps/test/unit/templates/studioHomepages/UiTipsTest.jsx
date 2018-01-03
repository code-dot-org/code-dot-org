import {expect} from '../../../util/configuredChai';
import React from 'react';
import {mount} from 'enzyme';
import UiTips from '@cdo/apps/templates/studioHomepages/UiTips';

const DEFAULT_PROPS = {
  tips: [
    {
      type: "triggered",
      position: {top: 80, right: 15},
      text: 'Test Tip',
      triggerId: "logo_home_link",
      arrowDirection: "up_corner"
    }
  ]
};

describe('UiTips', () => {
  it('renders', () => {
    const wrapper = mount(<UiTips {...DEFAULT_PROPS}/>);
    expect(wrapper).not.to.be.null;
  });
});
