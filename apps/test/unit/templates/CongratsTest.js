import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Congrats from '@cdo/apps/templates/Congrats';

describe('Congrats', () => {
  it('renders a Certificate component', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
      />
    );
    expect(wrapper.find('Certificate').exists()).to.be.true;
  });

  it('renders a StudentsBeyondHoc component', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
      />
    );
    expect(wrapper.find('StudentsBeyondHoc').exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
      />
    );
    expect(wrapper.find('TeachersBeyondHoc').exists()).to.be.true;
  });
});
