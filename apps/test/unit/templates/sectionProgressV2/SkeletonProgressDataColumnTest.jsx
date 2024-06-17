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
};

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

    screen.getByTestId('lesson-skeleton-cell-1');
    screen.getByTestId('lesson-skeleton-cell-2');
    screen.getByLabelText('Loading lesson');
    expect(screen.getAllByTestId(/lesson-skeleton-cell-.*/)).to.have.length(2);
  });

  it('Shows real header', () => {
    renderDefault();

    screen.getByTestId('lesson-skeleton-cell-1');
    screen.getByTestId('lesson-skeleton-cell-2');
    expect(screen.queryByLabelText('Loading lesson')).to.not.exist;
    expect(screen.getAllByTestId(/lesson-skeleton-cell-.*/)).to.have.length(2);
  });

  it('Shows expanded metadata rows', () => {
    renderDefault({expandedMetadataStudentIds: [1]});

    screen.getByTestId('lesson-skeleton-cell-1');
    screen.getByTestId('lesson-skeleton-cell-2');
    expect(screen.getAllByTestId(/lesson-skeleton-cell-.*/)).to.have.length(4);
  });
});
