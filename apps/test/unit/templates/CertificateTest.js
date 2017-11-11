import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Certificate from '@cdo/apps/templates/Certificate';

describe('Certificate', () => {
  it('renders a Minecraft certificate for new Minecraft tutorials', () => {
    const wrapper = shallow(
      <Certificate
        completedTutorialType="2017Minecraft"
      />
    );
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate')).to.be.true;
  });

  it('renders a Minecraft certificate for older Minecraft tutorials', () => {
    const wrapper = shallow(
      <Certificate
        completedTutorialType="pre2017Minecraft"
      />
    );
    expect(wrapper.find('img').html().includes('MC_Hour_Of_Code_Certificate')).to.be.true;
  });

  it('renders a default certificate for all other tutorials', () => {
    const wrapper = shallow(
      <Certificate
        completedTutorialType="other"
      />
    );
    expect(wrapper.find('img').html().includes('hour_of_code_certificate')).to.be.true;
  });
});
