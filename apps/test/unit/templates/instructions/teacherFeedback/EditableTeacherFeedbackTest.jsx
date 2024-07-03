import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import EditableFeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/EditableFeedbackStatus';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import {UnconnectedEditableTeacherFeedback as EditableTeacherFeedback} from '@cdo/apps/templates/instructions/teacherFeedback/EditableTeacherFeedback';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';

import {assert} from '../../../../util/reconfiguredChai';

const DEFAULT_PROPS = {
  user: 5,
  isEditable: true,
  rubric: null,
  visible: true,
  serverScriptId: 456,
  serverLevelId: 123,
  teacher: 5,
  latestFeedback: null,
  verifiedInstructor: true,
  selectedSectionId: 789,
  canHaveFeedbackReviewState: true,
  allowUnverified: false,
  updateUserProgress: () => {},
};

const RUBRIC = {
  keyConcept: 'This is the Key Concept',
  performanceLevel1: 'exceeded expectations',
  performanceLevel2: 'met expectations',
  performanceLevel3: 'approaches expectations',
  performanceLevel4: 'no evidence of trying',
};

const FEEDBACK = {
  comment: 'Good work!',
  created_at: '2019-03-26T19:56:53.000Z',
  id: 5,
  level_id: 123,
  performance: null,
  student_id: 1,
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<EditableTeacherFeedback {...props} />);
};

describe('EditableTeacherFeedback', () => {
  it('does not display tab content if it is not currently visible', () => {
    const wrapper = setUp({visible: false});
    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('logs Amplitude message when rubric level viewed', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    setUp({rubric: RUBRIC});

    expect(analyticsSpy).toHaveBeenCalledTimes(1);
    assert.equal(analyticsSpy.mock.calls[0].firstArg, 'Rubric Level Viewed');
    analyticsSpy.mockRestore();
  });

  it('does not log Amplitude message when non-rubric level viewed', () => {
    const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();
    setUp();

    expect(analyticsSpy).not.toHaveBeenCalled();
    analyticsSpy.mockRestore();
  });

  describe('without previous feedback', () => {
    it('does not display EditableFeedbackStatus', () => {
      const wrapper = setUp({rubric: null, latestFeedback: null});
      expect(wrapper.find(EditableFeedbackStatus)).toHaveLength(0);
    });

    it('displays a rubric with expected props if there is a rubric', () => {
      const wrapper = setUp({rubric: RUBRIC});
      const rubric = wrapper.find(Rubric);
      expect(rubric).toHaveLength(1);
      expect(rubric.props().rubric).toBe(RUBRIC);
      expect(rubric.props().isEditable).toBe(true);
    });

    it('does not display a rubric if there is no rubric', () => {
      const wrapper = setUp({rubric: null});
      expect(wrapper.find(Rubric)).toHaveLength(0);
    });

    it('displays the comment with expected props', () => {
      const wrapper = setUp();
      const confirmCommentArea = wrapper.find(Comment).first();
      expect(confirmCommentArea.props().isEditable).toBe(true);
      expect(confirmCommentArea.props().comment).toBe('');
    });

    it('displays submit feedback button with expected text', () => {
      const wrapper = setUp();
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).toBe(true);
      expect(confirmButton.props().text).toBe('Save and share');
    });

    it('renders EditableReviewState with expected props', () => {
      const wrapper = setUp();
      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).toHaveLength(1);
      expect(keepWorkingComponent.props().latestReviewState).toBeNull();
    });

    it('sends analytics event when feedback submitted', () => {
      const wrapper = setUp();
      const analyticsSpy = jest.spyOn(analyticsReporter, 'sendEvent').mockClear();

      wrapper.find('Button[id="ui-test-submit-feedback"]').simulate('click');
      assert(analyticsSpy.toHaveBeenCalledTimes(1));
      assert.equal(
        analyticsSpy.mock.calls[0].firstArg,
        'Level Feedback Submitted'
      );

      analyticsSpy.mockRestore();
    });
  });

  describe('with previous feedback given', () => {
    it('displays EditableFeedbackStatus if latestFeedback exists', () => {
      const latestFeedback = {
        student_seen_feedback: new Date(),
      };

      const wrapper = setUp({latestFeedback});
      const statusComponent = wrapper.find(EditableFeedbackStatus);
      expect(statusComponent).toHaveLength(1);
      expect(statusComponent.props().latestFeedback).toBe(latestFeedback);
    });

    it('displays the rubric if there is a rubric', () => {
      const latestFeedback = {
        ...FEEDBACK,
        performance: 'performanceLevel2',
      };

      const wrapper = setUp({rubric: RUBRIC, latestFeedback: latestFeedback});
      const rubric = wrapper.find(Rubric);
      expect(rubric).toHaveLength(1);
    });

    it('renders comment with expected props', () => {
      const wrapper = setUp({rubric: RUBRIC, latestFeedback: FEEDBACK});
      const confirmCommentArea = wrapper.find(Comment).first();
      expect(confirmCommentArea.props().isEditable).toBe(true);
      expect(confirmCommentArea.props().comment).toBe('Good work!');
    });

    it('displays submit button with expected text', () => {
      const wrapper = setUp({rubric: RUBRIC, latestFeedback: FEEDBACK});
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).toBe(true);
      expect(confirmButton.props().text).toBe('Update');
    });

    it('does not render EditableReviewState if not canHaveFeedbackReviewState', () => {
      const latestFeedback = {
        ...FEEDBACK,
        review_state: ReviewStates.completed,
      };
      const wrapper = setUp({
        latestFeedback,
        canHaveFeedbackReviewState: false,
      });

      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).toHaveLength(0);
    });

    it('renders EditableReviewState with expected props (completed)', () => {
      const latestFeedback = {
        ...FEEDBACK,
        review_state: ReviewStates.completed,
      };
      const wrapper = setUp({latestFeedback});

      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).toHaveLength(1);
      expect(keepWorkingComponent.props().latestReviewState).toBe(ReviewStates.completed);
    });

    it('renders EditableReviewState with expected props (awaitingReview)', () => {
      const latestFeedback = {
        ...FEEDBACK,
        is_awaiting_teacher_review: true,
      };
      const wrapper = setUp({latestFeedback});

      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).toHaveLength(1);
      expect(keepWorkingComponent.props().latestReviewState).toBe(ReviewStates.awaitingReview);
    });
  });
});
