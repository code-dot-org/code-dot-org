import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import Certificate from '@cdo/apps/templates/certificates/Certificate';
import StudentsBeyondHoc from '@cdo/apps/templates/certificates/StudentsBeyondHoc';
import TeachersBeyondHoc from '@cdo/apps/templates/certificates/TeachersBeyondHoc';

describe('Congrats', () => {
  const initialCertificateImageUrl = '/images/placeholder-hoc-image.jpg';
  const defaultProps = {
    completedTutorialType: 'other',
    userType: 'signedOut',
    language: 'en',
    initialCertificateImageUrl
  };

  it('renders a Certificate component', () => {
    const wrapper = shallow(<Congrats {...defaultProps} />);
    expect(wrapper.find(Certificate).exists()).to.be.true;
  });

  it('renders a StudentsBeyondHoc component, regardless of user type', () => {
    const wrapper = shallow(<Congrats {...defaultProps} />);
    expect(wrapper.find(StudentsBeyondHoc).exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for teachers', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="teacher" />);
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.true;
  });

  it('renders a TeachersBeyondHoc component, for signed out', () => {
    const wrapper = shallow(<Congrats {...defaultProps} />);
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.true;
  });

  it('does not render a TeachersBeyondHoc component, for students', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="student" />);
    expect(wrapper.find(TeachersBeyondHoc).exists()).to.be.false;
  });
});
