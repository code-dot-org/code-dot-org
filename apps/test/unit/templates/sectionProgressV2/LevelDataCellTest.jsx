import {render, screen} from '@testing-library/react';
import React from 'react';

import {UnconnectedLevelDataCell} from '@cdo/apps/templates/sectionProgressV2/LevelDataCell';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

import {expect} from '../../../util/reconfiguredChai';

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

describe('LevelDataCell', () => {
  const renderDefault = (propOverrides = {}) => {
    render(<UnconnectedLevelDataCell {...DEFAULT_PROPS} {...propOverrides} />);
  };

  it('Redirects with sectionId and studentId when specified', () => {
    renderDefault();

    expect(screen.getByRole('link').getAttribute('href')).to.equal(
      TEST_URL + '?section_id=1&user_id=1'
    );
  });
  it('Redirects without sectionId and studentId', () => {
    renderDefault({sectionId: null, studentId: null});

    expect(screen.getByRole('link').getAttribute('href')).to.equal(TEST_URL);
  });

  it('Expanded choice level', () => {
    renderDefault({expandedChoiceLevel: true});

    screen.getByRole('link', {name: 'progressicon-split'});
  });

  it('Keep working level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        teacherFeedbackReviewState: 'keepWorking',
        teacherFeedbackNew: true,
      },
    });

    screen.getByRole('link', {name: 'progressicon-rotate-left'});
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

    screen.getByRole('link', {name: 'progressicon-circle'});
  });

  it('Not tried level', () => {
    renderDefault();

    expect(screen.queryByRole('link', {name: /progressicon-^[a-z]*$/})).to.be
      .null;
  });

  it('Validated level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
      level: {isValidated: true, id: 1, url: TEST_URL},
    });

    screen.getByRole('link', {name: 'progressicon-circle-check'});
  });

  it('Submitted level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
    });

    screen.getByRole('link', {name: 'progressicon-circle'});
  });

  it('In progress level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.attempted,
      },
    });

    screen.getByRole('link', {name: 'progressicon-circle-o'});
  });
});
