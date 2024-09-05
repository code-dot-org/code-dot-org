import {render, screen} from '@testing-library/react';
import React from 'react';

import {ITEM_TYPE} from '@cdo/apps/templates/sectionProgressV2/ItemType';
import {UnconnectedLevelDataCell} from '@cdo/apps/templates/sectionProgressV2/LevelDataCell';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

const TEST_URL = 'https://www.test.com/';
const PROGRESS = {
  status: LevelStatus.not_tried,
  result: 0,
  locked: false,
  paired: false,
  teacherFeedbackReviewState: 'completed',
  teacherFeedbackNew: false,
};
const DEFAULT_PROPS = {
  level: {isValidated: false, id: 1, url: TEST_URL},
  studentId: 1,
  sectionId: 1,
  studentLevelProgress: PROGRESS,
  expandedChoiceLevel: false,
  lessonId: 1,
};

const wrapInTableStructure = element => (
  <table>
    <tbody>
      <tr>{element}</tr>
    </tbody>
  </table>
);

describe('LevelDataCell', () => {
  const renderDefault = (propOverrides = {}) => {
    render(
      wrapInTableStructure(
        <UnconnectedLevelDataCell {...DEFAULT_PROPS} {...propOverrides} />
      )
    );
  };

  it('Redirects with sectionId and studentId when specified', () => {
    renderDefault();

    expect(screen.getByRole('link').getAttribute('href')).toBe(
      TEST_URL + '?section_id=1&user_id=1'
    );
  });
  it('Redirects without sectionId and studentId', () => {
    renderDefault({sectionId: null, studentId: null});

    expect(screen.getByRole('link').getAttribute('href')).toBe(TEST_URL);
  });

  it('Expanded choice level', () => {
    renderDefault({expandedChoiceLevel: true});

    screen.getByRole('link', {name: ITEM_TYPE.CHOICE_LEVEL.title});
  });

  it('Keep working level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        teacherFeedbackReviewState: 'keepWorking',
        teacherFeedbackNew: true,
      },
    });

    screen.getByRole('link', {name: ITEM_TYPE.KEEP_WORKING.title});
  });

  it('Keep working level that the student has revisited', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
        teacherFeedbackReviewState: 'keepWorking',
        teacherFeedbackNew: false,
      },
    });

    screen.getByRole('link', {name: ITEM_TYPE.SUBMITTED.title});
  });

  it('Not tried level', () => {
    renderDefault();

    screen.getByRole('link', {name: ITEM_TYPE.NO_PROGRESS.title});
  });

  it('Validated perfect level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
      level: {isValidated: true, id: 1, url: TEST_URL},
    });

    screen.getByRole('link', {name: ITEM_TYPE.VALIDATED.title});
  });

  it('Validated passed level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.passed,
      },
      level: {isValidated: true, id: 1, url: TEST_URL},
    });

    screen.getByRole('link', {name: ITEM_TYPE.VALIDATED.title});
  });

  it('Submitted level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
    });

    screen.getByRole('link', {name: ITEM_TYPE.SUBMITTED.title});
  });

  it('In progress level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.attempted,
      },
    });

    screen.getByRole('link', {name: ITEM_TYPE.IN_PROGRESS.title});
  });
});
