import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';
import sinon from 'sinon'; // eslint-disable-line no-restricted-imports

import analyticsReporter from '@cdo/apps/metrics/AnalyticsReporter';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import EditableFeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/EditableFeedbackStatus';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import {UnconnectedEditableTeacherFeedback as EditableTeacherFeedback} from '@cdo/apps/templates/instructions/teacherFeedback/EditableTeacherFeedback';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';

import {expect, assert} from '../../../../util/reconfiguredChai'; // eslint-disable-line no-restricted-imports

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
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  it('logs Amplitude message when rubric level viewed', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    setUp({rubric: RUBRIC});

    expect(analyticsSpy).to.have.been.calledOnce;
    assert.equal(analyticsSpy.getCall(0).firstArg, 'Rubric Level Viewed');
    analyticsSpy.restore();
  });

  it('does not log Amplitude message when non-rubric level viewed', () => {
    const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');
    setUp();

    expect(analyticsSpy).not.to.have.been.called;
    analyticsSpy.restore();
  });

  describe('without previous feedback', () => {
    it('does not display EditableFeedbackStatus', () => {
      const wrapper = setUp({rubric: null, latestFeedback: null});
      expect(wrapper.find(EditableFeedbackStatus)).to.have.length(0);
    });

    it('displays a rubric with expected props if there is a rubric', () => {
      const wrapper = setUp({rubric: RUBRIC});
      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(RUBRIC);
      expect(rubric.props().isEditable).to.equal(true);
    });

    it('does not display a rubric if there is no rubric', () => {
      const wrapper = setUp({rubric: null});
      expect(wrapper.find(Rubric)).to.have.lengthOf(0);
    });

    it('displays the comment with expected props', () => {
      const wrapper = setUp();
      const confirmCommentArea = wrapper.find(Comment).first();
      expect(confirmCommentArea.props().isEditable).to.equal(true);
      expect(confirmCommentArea.props().comment).to.equal('');
    });

    it('displays submit feedback button with expected text', () => {
      const wrapper = setUp();
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).to.equal(true);
      expect(confirmButton.props().text).to.equal('Save and share');
    });

    it('renders EditableReviewState with expected props', () => {
      const wrapper = setUp();
      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).to.have.length(1);
      expect(keepWorkingComponent.props().latestReviewState).to.equal(null);
    });

    it('sends analytics event when feedback submitted', () => {
      const wrapper = setUp();
      const analyticsSpy = sinon.spy(analyticsReporter, 'sendEvent');

      wrapper.find('Button[id="ui-test-submit-feedback"]').simulate('click');
      assert(analyticsSpy.calledOnce);
      assert.equal(
        analyticsSpy.getCall(0).firstArg,
        'Level Feedback Submitted'
      );

      analyticsSpy.restore();
    });
  });

  describe('with previous feedback given', () => {
    it('displays EditableFeedbackStatus if latestFeedback exists', () => {
      const latestFeedback = {
        student_seen_feedback: new Date(),
      };

      const wrapper = setUp({latestFeedback});
      const statusComponent = wrapper.find(EditableFeedbackStatus);
      expect(statusComponent).to.have.length(1);
      expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
    });

    it('displays the rubric if there is a rubric', () => {
      const latestFeedback = {
        ...FEEDBACK,
        performance: 'performanceLevel2',
      };

      const wrapper = setUp({rubric: RUBRIC, latestFeedback: latestFeedback});
      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
    });

    it('renders comment with expected props', () => {
      const wrapper = setUp({rubric: RUBRIC, latestFeedback: FEEDBACK});
      const confirmCommentArea = wrapper.find(Comment).first();
      expect(confirmCommentArea.props().isEditable).to.equal(true);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');
    });

    it('displays submit button with expected text', () => {
      const wrapper = setUp({rubric: RUBRIC, latestFeedback: FEEDBACK});
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).to.equal(true);
      expect(confirmButton.props().text).to.equal('Update');
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
      expect(keepWorkingComponent).to.have.length(0);
    });

    it('renders EditableReviewState with expected props (completed)', () => {
      const latestFeedback = {
        ...FEEDBACK,
        review_state: ReviewStates.completed,
      };
      const wrapper = setUp({latestFeedback});

      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).to.have.length(1);
      expect(keepWorkingComponent.props().latestReviewState).to.equal(
        ReviewStates.completed
      );
    });

    it('renders EditableReviewState with expected props (awaitingReview)', () => {
      const latestFeedback = {
        ...FEEDBACK,
        is_awaiting_teacher_review: true,
      };
      const wrapper = setUp({latestFeedback});

      const keepWorkingComponent = wrapper.find(EditableReviewState);
      expect(keepWorkingComponent).to.have.length(1);
      expect(keepWorkingComponent.props().latestReviewState).to.equal(
        ReviewStates.awaitingReview
      );
    });
  });
});
