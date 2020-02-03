import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import Congrats from '@cdo/apps/templates/Congrats';
import Certificate from '@cdo/apps/templates/Certificate';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import TeachersBeyondHoc from '@cdo/apps/templates/TeachersBeyondHoc';

describe('Congrats', () => {
  it('renders a Certificate component', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        userType="signedOut"
        language="en"
      />
    );
    expect(wrapper.find(Certificate).exists()).to.be.true;
  });

  it('renders a StudentsBeyondHoc component, regardless of user type', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        userType="signedOut"
        language="en"
      />
    );
    expect(wrapper.find(StudentsBeyondHoc).exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for teachers', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        userType="teacher"
        language="en"
      />
    );
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for signed out', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        userType="signedOut"
        language="en"
      />
    );
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.true;
  });

  it('does not render a TeachersBeyondHoc component, for students', () => {
    const wrapper = shallow(
      <Congrats
        completedTutorialType="other"
        userType="student"
        language="en"
      />
    );
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.false;
  });
});
