import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import Certificate from '@cdo/apps/templates/certificates/Certificate';

describe('Congrats', () => {
  const userTypes = ['signedOut', 'teacher', 'student'];
  const initialCertificateImageUrl = '/images/placeholder-hoc-image.jpg';
  const defaultProps = {
    language: 'en',
    initialCertificateImageUrl,
  };

  userTypes.forEach(userType => {
    it(`renders a Certificate component for user type ${userType}`, () => {
      const wrapper = shallow(
        <Congrats {...defaultProps} userType={userType} />
      );
      expect(wrapper.find(Certificate).exists()).to.be.true;
    });
  });

  it('renders curriculum catalog button, for teachers', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="teacher" />);

    wrapper.find('a[href="/catalog"]');
  });

  it('renders two learning for ages buttons, for students', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="student" />);

    wrapper.find('a[href="https://code.org/student/elementary"]');
    wrapper.find('a[href="https://code.org/student/middle-high"]');
  });

  it('renders a professional learning section, for teachers', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="teacher" />);

    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.include('Teach with Code.org');
    expect(congratsPageText).to.include('Professional Learning');
  });

  it('renders a professional learning section, for signed out', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="teacher" />);
    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.include('Teach with Code.org');
    expect(congratsPageText).to.include('Professional Learning');
  });

  it('does not render a professional learning section, for students', () => {
    const wrapper = shallow(<Congrats {...defaultProps} userType="student" />);
    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.not.include('Teach with Code.org');
  });
});
