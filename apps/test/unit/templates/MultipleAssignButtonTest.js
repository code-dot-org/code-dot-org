import React from 'react';
import {shallow} from 'enzyme';
//import {assert} from '../../util/reconfiguredChai';
import {expect} from 'chai';
//import i18n from '@cdo/locale';
import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {
  assignToSection,
  testingFunction
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';
import {UnconnectedMultipleAssignButton as MultipleAssignButton} from '@cdo/apps/templates/MultipleAssignButton';
//import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';
// import MultipleAssignButton from '../../../src/templates/MultipleAssignButton';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';

// from SectionAssignerTest
describe('MultipleAssignButtonTest', () => {
  const defaultProps = {
    sectionId: 0,
    courseId: 1,
    courseOfferingId: 2,
    courseVersionId: 3,
    scriptId: 4,
    assignToSection: assignToSection,
    updateHiddenScript: updateHiddenScript,
    testingFunction: testingFunction,
    sectionsForDropdown: fakeTeacherSectionsForDropdown
  };
  const setUp = (overrideProps = {}) => {
    const props = {...defaultProps, ...overrideProps};
    return shallow(<MultipleAssignButton {...props} />);
  };

  it('renders a MultipleSectionsAssigner when clicked', () => {
    const wrapper = setUp();
    expect(wrapper.find('.uitest-assign-button')).to.exist;
    expect(wrapper.exists('MultipleSectionsAssigner')).to.be.false;
    wrapper.find('Button').simulate('click');
    expect(wrapper.exists('Connect(MultipleSectionsAssigner)')).to.be.true;
  });
});
