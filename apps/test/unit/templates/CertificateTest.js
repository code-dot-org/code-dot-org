import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Certificate from '@cdo/apps/templates/Certificate';
import Responsive from '@cdo/apps/responsive';

describe('Certificate', () => {
  it('renders a Minecraft certificate for new Minecraft tutorials', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <Certificate
        tutorial="minecraft"
        isRtl={false}
        responsive={responsive}
      />
    );
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate'));
  });

  it('renders a Minecraft certificate for older Minecraft tutorials', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <Certificate
        type="minecraft"
        isRtl={false}
        responsive={responsive}
      />
    );
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate'));
  });

  it('renders a default certificate for all other tutorials', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <Certificate
        tutorial="frozen"
        isRtl={false}
        responsive={responsive}
      />
    );
    expect(wrapper.find('img').html().includes('hour_of_code_certificate'));
  });
});
