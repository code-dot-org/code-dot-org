import {render, screen} from '@testing-library/react';
import React from 'react';

import {fakeLessonWithLevels} from '@cdo/apps/templates/progress/progressTestHelpers';
import {UnconnectedSkeletonProgressDataColumn} from '@cdo/apps/templates/sectionProgressV2/SkeletonProgressDataColumn.jsx';

import {expect} from '../../../util/reconfiguredChai';

const STUDENT_1 = {id: 1, name: 'Student 1', familyName: 'FamNameB'};
const STUDENT_2 = {id: 2, name: 'Student 2', familyName: 'FamNameA'};
const STUDENTS = [STUDENT_1, STUDENT_2];
const LESSON = fakeLessonWithLevels({}, 1);

const DEFAULT_PROPS = {
  lesson: LESSON,
  sortedStudents: STUDENTS,
  expandedMetadataStudentIds: [],
};

const getTestId = (lessonId, studentId, suffix = '') =>
  `lesson-skeleton-cell-${studentId}.${lessonId}${suffix}`;

function renderDefault(overrideProps = {}) {
  render(
    <UnconnectedSkeletonProgressDataColumn
      {...DEFAULT_PROPS}
      {...overrideProps}
    />
  );
}

describe('SkeletonProgressDataColumn', () => {
  it('Shows skeleton if fake lesson', () => {
    renderDefault({lesson: {id: 1, isFake: true}});

    screen.getByTestId(getTestId(1, STUDENT_1.id));
    screen.getByTestId(getTestId(1, STUDENT_2.id));
    screen.getByLabelText('Loading lesson');
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).to.have.length(2);
  });

  it('Shows real header', () => {
    renderDefault();

    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_2.id));
    expect(screen.queryByLabelText('Loading lesson')).to.not.exist;
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).to.have.length(2);
  });

  it('Shows expanded metadata rows', () => {
    renderDefault({expandedMetadataStudentIds: [1]});

    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id, '-last-updated'));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_1.id, '-time-spent'));
    screen.getByTestId(getTestId(LESSON.id, STUDENT_2.id));
    expect(
      screen.getAllByTestId('lesson-skeleton-cell', {exact: false})
    ).to.have.length(4);
  });
});
