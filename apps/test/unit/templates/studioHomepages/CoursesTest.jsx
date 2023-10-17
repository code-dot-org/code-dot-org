import React from 'react';
import {assert} from 'chai';
import {mount, shallow} from 'enzyme';
import {Provider} from 'react-redux';
import {getStore} from '@cdo/apps/code-studio/redux';
import Courses from '@cdo/apps/templates/studioHomepages/Courses';
import HeaderBanner from '@cdo/apps/templates/HeaderBanner';

const TEST_PROPS = {
  isEnglish: true,
  isSignedOut: true,
  studentsCount: '0',
  modernElementaryCoursesAvailable: true,
};

describe('Courses', () => {
  describe('hero banner', () => {
    it('shows a short banner when signed in', () => {
      const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={false} />);
      const header = wrapper.find(HeaderBanner);
      assert.isUndefined(header.prop('description'));
    });

    it('shows a long banner when signed out', () => {
      const wrapper = shallow(<Courses {...TEST_PROPS} isSignedOut={true} />);
      const header = wrapper.find(HeaderBanner);
      assert.isString(header.prop('description'));
    });
  });

  describe('course ordering', () => {
    it('English', () => {
      const wrapper = mountCourses({isEnglish: true});
      assertComponentsInOrder(wrapper, [
        'SpecialAnnouncement',
        'CourseBlocksWrapper',
        'CourseBlocksHoc',
        'LocalClassActionBlock',
      ]);
    });

    describe('non-English', () => {
      const isEnglish = false;

      it('modern CSF', () => {
        const wrapper = mountCourses({
          isEnglish,
          modernElementaryCoursesAvailable: true,
        });
        assertComponentsInOrder(wrapper, [
          'ModernCsfCourses',
          'CourseBlocksHoc',
          'SpecialAnnouncement',
          'CoursesAToF',
          'LegacyCSFNotification',
          'CourseBlocksWrapper',
          'CourseBlocksWrapper',
        ]);
      });

      it('legacy CSF', () => {
        const wrapper = mountCourses({
          isEnglish,
          modernElementaryCoursesAvailable: false,
        });
        assertComponentsInOrder(wrapper, [
          'AcceleratedAndUnplugged',
          'CourseBlocksHoc',
          'SpecialAnnouncement',
          'Courses1To4',
          'CourseBlocksWrapper',
          'CourseBlocksWrapper',
        ]);
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
