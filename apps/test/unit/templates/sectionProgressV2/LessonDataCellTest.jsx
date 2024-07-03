import {render, screen, cleanup} from '@testing-library/react';
import React from 'react';

import {UnconnectedLessonDataCell} from '@cdo/apps/templates/sectionProgressV2/LessonDataCell';

const DEFAULT_PROPS = {
  locked: false,
  sectionId: 1,
  studentLessonProgress: {
    incompletePercent: 20,
    imperfectPercent: 20,
    completedPercent: 60,
    timeSpent: 300,
    lastTimestamp: 1614841198,
  },
  lesson: {
    id: 1,
    levels: [{id: 1}],
  },
  addExpandedLesson: () => {},
  studentId: 1,
  metadataExpanded: false,
};

describe('LevelDataCell', () => {
  const renderDefault = (propOverrides = {}) => {
    render(<UnconnectedLessonDataCell {...DEFAULT_PROPS} {...propOverrides} />);
  };

  it('Shows empty if no progress', () => {
    renderDefault({studentLessonProgress: null});

    const cell = screen.getByTestId('lesson-data-cell-1-1');
    expect(cell.children).toHaveLength(0);
  });

  it('Shows No Online Work', () => {
    renderDefault({lesson: {id: 1, levels: []}});

    screen.getByLabelText('No online work');
  });

  it('Shows in progress', () => {
    renderDefault();

    screen.getByLabelText('In progress');
  });

  it('Shows submitted', () => {
    renderDefault({
      studentLessonProgress: {
        incompletePercent: 0,
        imperfectPercent: 0,
        completedPercent: 100,
        timeSpent: 300,
        lastTimestamp: 1614841198,
      },
    });

    screen.getByLabelText('Submitted');
  });

  it('Shows last updated', () => {
    renderDefault({metadataExpanded: true});

    screen.getByText('3/4');

    cleanup();

    renderDefault({
      metadataExpanded: true,
      studentLessonProgress: {
        incompletePercent: 20,
        imperfectPercent: 20,
        completedPercent: 60,
        timeSpent: 300,
        lastTimestamp: 1614991198,
      },
    });
    screen.getByText('3/6');
  });

  it('Shows time spent', () => {
    renderDefault({metadataExpanded: true});

    screen.getByText('5');

    cleanup();

    renderDefault({
      metadataExpanded: true,
      studentLessonProgress: {
        incompletePercent: 20,
        imperfectPercent: 20,
        completedPercent: 60,
        timeSpent: 621,
        lastTimestamp: 1614841198,
      },
    });

    screen.getByText('11');
  });
});
