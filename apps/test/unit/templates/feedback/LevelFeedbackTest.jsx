import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import Button from '@cdo/apps/templates/Button';
import LevelFeedback from '@cdo/apps/templates/feedback/LevelFeedback';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import i18n from '@cdo/locale';

const feedback = {
  id: 1,
  seen_on_feedback_page_at: null,
  student_first_visited_at: null,
  created_at: new Date(),
  comment: 'Great Work',
  performance: 'performanceLevel1',
  review_state: null,
  is_awaiting_teacher_review: false,
};

const additionalFeedback = {
  id: 2,
  seen_on_feedback_page_at: null,
  student_first_visited_at: null,
  created_at: new Date(),
  comment: 'Great Work',
  performance: 'performanceLevel1',
  review_state: null,
  is_awaiting_teacher_review: false,
};

const DEFAULT_PROPS = {
  lessonName: 'A Lesson',
  lessonNum: 1,
  levelNum: 5,
  linkToLevel: '/link-to-level',
  unitName: 'A Unit',
  feedbacks: [feedback],
};

const setUp = overrideProps => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<LevelFeedback {...props} />);
};

describe('LevelFeedbackEntry', () => {
  it('displays the expected header', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Lesson 1: Level 5')).toBe(true);
  });

  it('has a link to the level', () => {
    const wrapper = setUp();
    expect(wrapper.find('a').props().href).toBe('/link-to-level');
  });

  it('displays the unit name', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Unit')).toBe(true);
  });

  it('renders the show older comments buttons if there is more than one feedback for the level', () => {
    const wrapper = setUp({feedbacks: [feedback, additionalFeedback]});
    expect(wrapper.find(Button)).toHaveLength(1);
    expect(wrapper.find(Button).props().text).toBe(i18n.showOlderComments());
  });

  it('hides the show older comments buttons if there is one feedback for the level', () => {
    const wrapper = setUp();
    expect(wrapper.find(Button)).toHaveLength(0);
  });

  it('displays all feedbacks when show older comments is clicked', () => {
    const wrapper = setUp({feedbacks: [feedback, additionalFeedback]});
    expect(wrapper.find(LevelFeedbackEntry)).toHaveLength(1);
    wrapper.find(Button).simulate('click');
    expect(wrapper.find(LevelFeedbackEntry)).toHaveLength(2);
    expect(wrapper.find(Button).props().text).toBe(i18n.hideOlderComments());
  });
});
