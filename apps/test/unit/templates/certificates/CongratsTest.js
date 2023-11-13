import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import Congrats from '@cdo/apps/templates/certificates/Congrats';
import Certificate from '@cdo/apps/templates/certificates/Certificate';
import GraduateToNextLevel from '@cdo/apps/templates/certificates/GraduateToNextLevel';

describe('Congrats', () => {
  const userTypes = ['signedOut', 'teacher', 'student'];
  const initialCertificateImageUrl = '/images/placeholder-hoc-image.jpg';
  const defaultProps = {
    language: 'en',
    initialCertificateImageUrl,
    isHocTutorial: false,
  };

  const hocProps = {
    language: 'en',
    initialCertificateImageUrl,
    isHocTutorial: true,
  };

  //Non HOC course Tests
  userTypes.forEach(userType => {
    it(`renders a Certificate component for user type ${userType}`, () => {
      const wrapper = shallow(
        <Congrats {...defaultProps} userType={userType} />
      );
      expect(wrapper.find(Certificate).exists()).to.be.true;
    });

    it(`renders a GraduateToNextLevel for user type ${userType} for CSF course`, () => {
      const wrapper = shallow(
        <Congrats {...defaultProps} userType={userType} isHocTutorial={false} />
      );
      expect(wrapper.find(GraduateToNextLevel).exists()).to.be.true;
    });
  });

  //HOC tutorial tests

  userTypes.forEach(userType => {
    it(`renders a Certificate component for user type ${userType}`, () => {
      const wrapper = shallow(<Congrats {...hocProps} userType={userType} />);
      expect(wrapper.find(Certificate).exists()).to.be.true;
    });
  });

  it('renders curriculum catalog button, for teachers', () => {
    const wrapper = shallow(<Congrats {...hocProps} userType="teacher" />);
    expect(wrapper.find('a[href="/catalog"]').exists()).to.be.true;
  });

  it('renders two learning for ages buttons, for students', () => {
    const wrapper = shallow(<Congrats {...hocProps} userType="student" />);

    expect(
      wrapper.find('a[href="https://code.org/student/elementary"]').exists()
    ).to.be.true;
    expect(
      wrapper.find('a[href="https://code.org/student/middle-high"]').exists()
    ).to.be.true;
  });

  it('renders a professional learning section, for teachers', () => {
    const wrapper = shallow(<Congrats {...hocProps} userType="teacher" />);

    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.include('Teach with Code.org');
    expect(congratsPageText).to.include('Professional Learning');
  });

  it('renders a professional learning section, for signed out', () => {
    const wrapper = shallow(<Congrats {...hocProps} userType="teacher" />);
    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.include('Teach with Code.org');
    expect(congratsPageText).to.include('Professional Learning');
  });

  it('does not render a professional learning section, for students', () => {
    const wrapper = shallow(<Congrats {...hocProps} userType="student" />);
    const congratsPageText = wrapper.text();

    expect(congratsPageText).to.not.include('Teach with Code.org');
  });
});
