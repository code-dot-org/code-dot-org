import React from 'react';
import {render, screen} from '@testing-library/react';
import {UnconnectedLevelDataCell} from '@cdo/apps/templates/sectionProgressV2/LevelDataCell';
import {expect} from '../../../util/reconfiguredChai';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const TEST_URL = 'https://www.test.com/';
const PROGRESS = {
  status: LevelStatus.not_tried,
  result: 0,
  locked: false,
  paired: false,
};
const DEFAULT_PROPS = {
  level: {isValidated: false, id: 1, url: TEST_URL},
  studentId: 1,
  sectionId: 1,
  studentLevelProgress: PROGRESS,
  expandedChoiceLevel: false,
};

describe('ProgressTableV2', () => {
  const renderDefault = (propOverrides = {}) => {
    render(<UnconnectedLevelDataCell {...DEFAULT_PROPS} {...propOverrides} />);
  };

  it('Redirects with sectionId and studentId when specified', () => {
    renderDefault();

    screen.getByRole('link', {href: TEST_URL + '?section_id=1&user_id=1'});
  });
  it('Redirects without sectionId and studentId', () => {
    renderDefault({sectionId: null, studentId: null});

    screen.getByRole('link', {href: TEST_URL});
  });

  it('Expanded choice level', () => {
    renderDefault({expandedChoiceLevel: true});

    screen.getByLabelText('progressicon-split');
  });

  it('Keep working level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        teacherFeedbackReviewState: 'keepWorking',
      },
    });

    screen.getByLabelText('progressicon-rotate-left');
  });

  it('Not tried level', () => {
    renderDefault();

    expect(screen.queryByLabelText('progressicon-', {exact: false})).to.be.null;
  });

  it('Validated level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
      level: {isValidated: true, id: 1, url: TEST_URL},
    });

    screen.getByLabelText('progressicon-circle-check');
  });

  it('Submitted level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.perfect,
      },
    });

    screen.getByLabelText('progressicon-circle');
  });

  it('In progress level', () => {
    renderDefault({
      studentLevelProgress: {
        ...PROGRESS,
        status: LevelStatus.attempted,
      },
    });

    screen.getByLabelText('progressicon-circle-o');
  });
});
