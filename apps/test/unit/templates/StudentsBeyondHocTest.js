import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/configuredChai';
import StudentsBeyondHoc from '@cdo/apps/templates/StudentsBeyondHoc';
import Responsive from '@cdo/apps/responsive';

describe('StudentsBeyondHoc', () => {
  it('renders a VerticalImageResourceCardRow component', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink=""
        responsive={responsive}
        isRtl={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('VerticalImageResourceCardRow').exists());
  });

  it('renders a CourseBlocksStudentGradeBands component', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        responsive={responsive}
        isRtl={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('CourseBlocksStudentGradeBands').exists());
  });

  it('renders a LocalClassActionBlock component', () => {
    const responsive = new Responsive();
    const wrapper = shallow(
      <StudentsBeyondHoc
        completedTutorialType="other"
        MCShareLink="code.org/minecraft/sharelink"
        responsive={responsive}
        isRtl={false}
        userType="signedOut"
        isEnglish={true}
      />
    );
    expect(wrapper.find('LocalClassActionBlock').exists());
  });
});
