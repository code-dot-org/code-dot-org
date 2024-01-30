import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';

import SkeletonProgressDataColumn from '@cdo/apps/templates/sectionProgressV2/SkeletonProgressDataColumn.jsx';
import skeletonizeContent from '@cdo/apps/componentLibrary/skeletonize-content.module.scss';

import {fakeLessonWithLevels} from '@cdo/apps/templates/progress/progressTestHelpers';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);

const DEFAULT_PROPS = {
  lesson: LESSON,
  sortedStudents: STUDENTS,
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<SkeletonProgressDataColumn {...props} />);
};

describe('SkeletonProgressDataColumn', () => {
  it('Shows skeleton if fake lesson', () => {
    const wrapper = setUp({lesson: {id: 1, isFake: true}});

    expect(
      wrapper.find(`.${skeletonizeContent.skeletonizeContent}`)
    ).to.have.length(STUDENTS.length + 1);
  });

  it('Shows real header', () => {
    const wrapper = setUp();

    expect(
      wrapper.find(`.${skeletonizeContent.skeletonizeContent}`)
    ).to.have.length(STUDENTS.length);
  });
});
