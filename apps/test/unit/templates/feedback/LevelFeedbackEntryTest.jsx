import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import ReactDOM from 'react-dom';

import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import {KeepWorkingBadge} from '@cdo/apps/templates/progress/BubbleBadge';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const NO_FEEDBACK = {
  id: 1,
  seen_on_feedback_page_at: null,
  student_first_visited_at: null,
  created_at: new Date(),
  comment: 'Great Work',
  performance: 'performanceLevel1',
  review_state: null,
  is_awaiting_teacher_review: false,
};

const setUp = overrideFeedback => {
  const props = {
    feedback: {...NO_FEEDBACK, ...overrideFeedback},
  };
  return mount(<LevelFeedbackEntry {...props} />);
};

describe('LevelFeedbackEntry', () => {
  it('displays the created date', () => {
    const createdDate = new Date();
    const wrapper = setUp({created_at: createdDate});
    const timeAgoComponent = wrapper.find(TimeAgo);
    expect(timeAgoComponent).toHaveLength(1);
    expect(timeAgoComponent.props().dateString).toBe(createdDate);
  });

  it('displays background as lightest_gray with no opacity set if the student has not seen feedback', () => {
    const wrapper = setUp();
    const containerStyle = wrapper.childAt(0).props().style;
    expect(containerStyle.backgroundColor).toBe(color.lightest_gray);
    expect(containerStyle.opacity).toBeUndefined();
  });

  it('displays opacity as 60% if student has seen feedback', () => {
    const wrapper = setUp({
      student_first_visited_at: new Date().toString(),
      seen_on_feedback_page_at: new Date().toString(),
    });
    const containerStyle = wrapper.childAt(0).props().style;
    expect(containerStyle.opacity).toBe('60%');
  });

  it('displays review state badge if review state is keep working (not awaiting review)', () => {
    const wrapper = setUp({review_state: ReviewStates.keepWorking});
    expect(wrapper.find(KeepWorkingBadge)).toHaveLength(1);
    expect(wrapper.contains(i18n.keepWorking())).toBe(true);
  });

  it('displays awaiting review if review state is present and is_awaiting_teacher_review', () => {
    const wrapper = setUp({
      review_state: ReviewStates.keepWorking,
      is_awaiting_teacher_review: true,
    });
    expect(wrapper.contains(i18n.waitingForTeacherReview())).toBe(true);
  });

  it('displays completed if review_state is keepWorking and feedback is awaiting review', () => {
    const wrapper = setUp({
      review_state: ReviewStates.completed,
    });
    expect(wrapper.contains(i18n.reviewedComplete())).toBe(true);
  });

  it('displays performance copy if performance value exists', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.feedbackRubricEvaluation())).toBe(true);
    expect(wrapper.contains(i18n.rubricLevelOneHeader())).toBe(true);
  });

  it('does not display performance copy if value does not exist', () => {
    const wrapper = setUp({performance: null});
    expect(wrapper.contains(i18n.feedbackRubricEvaluation())).toBe(false);
  });

  it('displays the comment if there is a comment', () => {
    const wrapper = setUp();
    expect(wrapper.contains('Great Work')).toBe(true);
  });

  it('hides the comment expander if the comment is not long', () => {
    jest
      .spyOn(ReactDOM, 'findDOMNode')
      .mockClear()
      .mockReturnValue({offsetHeight: 20});
    const wrapper = setUp({});
    expect(wrapper.find({icon: 'caret-right'})).toHaveLength(0);
    ReactDOM.findDOMNode.mockRestore();
  });

  it('displays the comment expander if the comment is long', () => {
    jest
      .spyOn(ReactDOM, 'findDOMNode')
      .mockClear()
      .mockReturnValue({offsetHeight: 60});
    const wrapper = setUp({});
    expect(wrapper.find({icon: 'caret-right'})).toHaveLength(1);
    ReactDOM.findDOMNode.mockRestore();
  });

  it('displays the fade if the comment is long (and collapsed)', () => {
    jest
      .spyOn(ReactDOM, 'findDOMNode')
      .mockClear()
      .mockReturnValue({offsetHeight: 60});
    const wrapper = setUp({});
    expect(wrapper.find('#comment-fade')).toHaveLength(1);
    ReactDOM.findDOMNode.mockRestore();
  });
});
