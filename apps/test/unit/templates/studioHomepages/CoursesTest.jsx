import React from 'react';
import {assert} from 'chai';
import {mount, shallow} from 'enzyme';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';
import Courses from '@cdo/apps/templates/studioHomepages/Courses';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

const TEST_PROPS = {
  isEnglish: true,
  isTeacher: true,
  isSignedOut: true,
  linesCount: '0',
  studentsCount: '0',
  modernElementaryCoursesAvailable: true
};

describe('Courses', () => {
  describe('hero banner', () => {
    it('shows a short banner when signed in', () => {
      const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={false} />);
      const header = wrapper.find(HeaderBanner);
      assert.isTrue(header.prop('short'));
      assert.isUndefined(header.prop('description'));
    });

    it('shows a long banner when signed out', () => {
      const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={true} />);
      const header = wrapper.find(HeaderBanner);
      assert.isFalse(header.prop('short'));
      assert.isString(header.prop('description'));
    });
  });

  describe('course ordering', () => {
    describe('English', () => {
      const isEnglish = true;

      it('as student', () => {
        const wrapper = mountCourses({isEnglish, isTeacher: false});
        assertComponentsInOrder(wrapper, [
          'SpecialAnnouncement',
          'CourseBlocksStudentGradeBands',
          'CourseBlocksHoc',
          'LocalClassActionBlock'
        ]);
      });

      it('as teacher', () => {
        const wrapper = mountCourses({isEnglish, isTeacher: true});
        assertComponentsInOrder(wrapper, [
          'CoursesTeacherEnglish',
          'CourseBlocksTeacherGradeBands',
          'CourseBlocksHoc',
          'CourseBlocksTools',
          'AdministratorResourcesActionBlock'
        ]);
      });
    });

    describe('non-English', () => {
      const isEnglish = false;

      // Student and teacher view should be the same for international
      // users.  Run all tests for both cases to verify that this is true.
      [false, true].forEach(isTeacher => {
        describe(isTeacher ? 'as teacher' : 'as student', () => {
          it('modern CSF', () => {
            const wrapper = mountCourses({
              isEnglish,
              isTeacher,
              modernElementaryCoursesAvailable: true
            });
            assertComponentsInOrder(wrapper, [
              'ModernCsfCourses',
              'CourseBlocksHoc',
              'SpecialAnnouncement',
              'CoursesAToF',
              'LegacyCSFNotification',
              'CourseBlocksInternationalGradeBands',
              'CourseBlocksTools'
            ]);
          });

          it('legacy CSF', () => {
            const wrapper = mountCourses({
              isEnglish,
              isTeacher,
              modernElementaryCoursesAvailable: false
            });
            assertComponentsInOrder(wrapper, [
              'AcceleratedAndUnplugged',
              'CourseBlocksHoc',
              'SpecialAnnouncement',
              'Courses1To4',
              'CourseBlocksInternationalGradeBands',
              'CourseBlocksTools'
            ]);
          });
        });
      });
    });
  });
});

function mountCourses(overrideProps) {
  return mount(
    <Provider store={getStore()}>
      <Courses {...TEST_PROPS} {...overrideProps} />
    </Provider>
  );
}

/**
 * Asserts a list of components (given by name) can be found
 * within the provided wrapper, in the order given.  Ignores
 * any other content in the wrapper.
 *
 * @param {EnzymeWrapper} wrapper
 * @param {Array.<string>} expectedComponents Component names,
 *   in the order that we expect to find them on the page.
 */
function assertComponentsInOrder(wrapper, expectedComponents) {
  const foundComponents = wrapper
    .findWhere(n => expectedComponents.includes(n.name()))
    .map(c => c.name());
  assert.deepEqual(foundComponents, expectedComponents);
}
