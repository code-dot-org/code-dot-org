import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import Congrats from '@cdo/apps/templates/Congrats';
import Certificate from '@cdo/apps/templates/Certificate';

describe('Congrats', () => {
  it('renders a Certificate component', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find(Certificate).exists()).to.be.true;
  });

  it('renders a StudentsBeyondHoc component, regardless of user type', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
        signedIn={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('StudentsBeyondHoc').exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for teachers', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
        userType="teacher"
        isEnglish={true}
      />
    );
    expect(wrapper.find('TeachersBeyondHoc').exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for signed out', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('TeachersBeyondHoc').exists()).to.be.true;
  });

  it('does not render a TeachersBeyondHoc component, for students', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        isRtl={false}
        userType="student"
        isEnglish={true}
      />
    );
    expect(wrapper.find('TeachersBeyondHoc').exists()).to.be.false;
  });
});
