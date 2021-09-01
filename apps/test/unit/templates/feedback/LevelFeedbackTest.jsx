import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import LevelFeedback from '@cdo/apps/templates/feedback/LevelFeedback';

const DEFAULT_FEEDBACK = {
  seen_on_feedback_page_at: null,
  student_first_visited_at: null,
  created_at: new Date(),
  comment: 'Great Work',
  performance: 'performanceLevel1',
  review_state: null,
  is_awaiting_teacher_review: false
};

const DEFAULT_PROPS = {
  lessonName: 'A Lesson',
  lessonNum: 1,
  levelNum: 5,
  linkToLevel: '/link-to-level',
  unitName: 'A Unit',
  feedbacks: [DEFAULT_FEEDBACK]
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LevelFeedback {...props} />);
};

describe('LevelFeedbackEntry', () => {
  it('displays the expected header', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Lesson 1: Level 5')).to.be.true;
  });

  it('has a link to the level', () => {});

  it('displays the unit name', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Unit')).to.be.true;
  });

  it('displays the show past comments buttons if there is more than one feedback for the level', () => {});

  it('hides the show past comments buttons if there is one feedback for the level', () => {});

  it('displays all feedbacks when show past comments is clicked', () => {});
});
