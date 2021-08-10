import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnconnectedTeacherFeedback as TeacherFeedback} from '@cdo/apps/templates/instructions/teacherFeedback/TeacherFeedback';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import experiments from '@cdo/apps/util/experiments';
import sinon from 'sinon';
import Comment from '@cdo/apps/templates/instructions/teacherFeedback/Comment';
import EditableReviewState from '@cdo/apps/templates/instructions/teacherFeedback/EditableReviewState';
import ReadOnlyReviewState from '@cdo/apps/templates/instructions/teacherFeedback/ReadOnlyReviewState';
import FeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/FeedbackStatus';
import Rubric from '@cdo/apps/templates/instructions/teacherFeedback/Rubric';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';

const DEFAULT_PROPS = {
  user: 5,
  isEditable: true,
  rubric: null,
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  latestFeedback: null,
  canHaveFeedbackReviewState: true
};

const RUBRIC = {
  keyConcept: 'This is the Key Concept',
  performanceLevel1: 'exceeded expectations',
  performanceLevel2: 'met expectations',
  performanceLevel3: 'approaches expectations',
  performanceLevel4: 'no evidence of trying'
};

const FEEDBACK = {
  comment: 'Good work!',
  created_at: '2019-03-26T19:56:53.000Z',
  id: 5,
  level_id: 123,
  performance: null,
  student_id: 1
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<TeacherFeedback {...props} />);
};

describe('TeacherFeedback', () => {
  it('does not display tab content if it is not currently visible', () => {
    const wrapper = setUp({visible: false});
    expect(wrapper.isEmptyRender()).to.be.true;
  });

  describe('viewed as Teacher - looking at student work', () => {
    describe('without previous feedback', () => {
      it('does not display FeedbackStatus', () => {
        const wrapper = setUp({rubric: null, latestFeedback: null});
        expect(wrapper.find(FeedbackStatus)).to.have.length(0);
      });

      it('displays a rubric with expected props if there is a rubric', () => {
        const wrapper = setUp({rubric: RUBRIC});
        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(RUBRIC);
        expect(rubric.props().isEditable).to.equal(true);
        expect(rubric.props().viewAs).to.equal(ViewType.Teacher);
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

      it('renders EditableReviewState with expected props if part of the experiment', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const wrapper = setUp();
        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(1);
        expect(keepWorkingComponent.props().latestReviewState).to.equal(null);

        experiments.isEnabled.restore();
      });
    });

    describe('with previous feedback given', () => {
      it('displays FeedbackStatus if latestFeedback exists', () => {
        const latestFeedback = {
          student_seen_feedback: new Date()
        };

        const wrapper = setUp({latestFeedback});
        const statusComponent = wrapper.find(FeedbackStatus);
        expect(statusComponent).to.have.length(1);
        expect(statusComponent.props().viewAs).to.equal('Teacher');
        expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
      });

      it('displays the rubric if there is a rubric', () => {
        const latestFeedback = {
          ...FEEDBACK,
          performance: 'performanceLevel2'
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

      it('does not render EditableReviewState if part of the experiment and has not canHaveFeedbackReviewState', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const latestFeedback = {
          ...FEEDBACK,
          review_state: ReviewStates.completed
        };
        const wrapper = setUp({
          latestFeedback,
          canHaveFeedbackReviewState: false
        });

        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(0);

        experiments.isEnabled.restore();
      });

      it('renders EditableReviewState with expected props (completed) if part of the experiment', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const latestFeedback = {
          ...FEEDBACK,
          review_state: ReviewStates.completed
        };
        const wrapper = setUp({latestFeedback});

        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(1);
        expect(keepWorkingComponent.props().latestReviewState).to.equal(
          ReviewStates.completed
        );

        experiments.isEnabled.restore();
      });

      it('renders EditableReviewState with expected props (awaitingReview) if part of the experiment', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const latestFeedback = {
          ...FEEDBACK,
          is_awaiting_teacher_review: true
        };
        const wrapper = setUp({latestFeedback});

        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(1);
        expect(keepWorkingComponent.props().latestReviewState).to.equal(
          ReviewStates.awaitingReview
        );

        experiments.isEnabled.restore();
      });
    });
  });

  describe('viewed as teacher - not looking at student work', () => {
    it('displays readonly rubric if rubric exists for level', () => {
      const wrapper = setUp({isEditable: false, rubric: RUBRIC});
      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(RUBRIC);
      expect(rubric.props().isEditable).to.equal(false);
    });

    it('does not display comment area', () => {
      const wrapper = setUp({isEditable: false, rubric: RUBRIC});
      expect(wrapper.find(Comment)).to.have.lengthOf(0);
    });

    it('does not display submit button', () => {
      const wrapper = setUp({isEditable: false, rubric: RUBRIC});
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
  });

  describe('viewed as a Student', () => {
    const STUDENT_PROPS = {
      viewAs: 'Student',
      isEditable: false
    };
    describe('without previous feedback given', () => {
      it('does not display FeedbackStatus', () => {
        const wrapper = setUp({
          rubric: RUBRIC,
          ...STUDENT_PROPS
        });
        expect(wrapper.find(FeedbackStatus)).to.have.length(0);
      });

      it('displays rubric with expected props if there is a rubric', () => {
        const wrapper = setUp({
          rubric: RUBRIC,
          ...STUDENT_PROPS
        });
        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(RUBRIC);
        expect(rubric.props().isEditable).to.equal(false);
        expect(rubric.props().viewAs).to.equal(ViewType.Student);
      });

      it('does not display the comment area', () => {
        const wrapper = setUp({
          rubric: RUBRIC,
          ...STUDENT_PROPS
        });
        expect(wrapper.find(Comment)).to.have.lengthOf(0);
      });

      it('does not display the submit feedback button', () => {
        const wrapper = setUp({
          rubric: RUBRIC,
          ...STUDENT_PROPS
        });
        expect(wrapper.find('Button')).to.have.lengthOf(0);
      });

      it('does not display ReadOnlyReviewState', () => {
        const wrapper = setUp({
          rubric: RUBRIC,
          ...STUDENT_PROPS
        });
        expect(wrapper.find(ReadOnlyReviewState)).to.have.lengthOf(0);
      });
    });

    describe('with previous feedback given', () => {
      it('displays FeedbackStatus', () => {
        const latestFeedback = {
          student_seen_feedback: new Date(),
          comment: 'Great!'
        };
        const wrapper = setUp({
          rubric: RUBRIC,
          latestFeedback,
          ...STUDENT_PROPS
        });

        const statusComponent = wrapper.find(FeedbackStatus);
        expect(statusComponent).to.have.length(1);
        expect(statusComponent.props().viewAs).to.equal('Student');
        expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
      });

      it('does not render rubric if there is no rubric for the level', () => {
        const wrapper = setUp({
          latestFeedback: FEEDBACK,
          ...STUDENT_PROPS
        });
        expect(wrapper.find(Rubric)).to.have.lengthOf(0);
      });

      it('renders rubric with expected props if there is a rubric for the level', () => {
        const latestFeedback = {
          ...FEEDBACK,
          performance: 'performanceLevel2'
        };

        const wrapper = setUp({
          rubric: RUBRIC,
          latestFeedback,
          ...STUDENT_PROPS
        });

        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(RUBRIC);
        expect(rubric.props().performance).to.equal('performanceLevel2');
        expect(rubric.props().isEditable).to.equal(false);
        expect(rubric.props().viewAs).to.equal(ViewType.Student);
      });

      it('renders the comment with expected props if there is a comment', () => {
        const wrapper = setUp({
          latestFeedback: FEEDBACK,
          ...STUDENT_PROPS
        });
        const confirmCommentArea = wrapper.find(Comment).first();
        expect(confirmCommentArea.props().isEditable).to.equal(false);
        expect(confirmCommentArea.props().comment).to.equal('Good work!');
      });

      it('does not render a comment if no comment was given with feedback', () => {
        const latestFeedback = {
          ...FEEDBACK,
          comment: '',
          performance: 'performanceLevel2'
        };

        const wrapper = setUp({
          rubric: RUBRIC,
          latestFeedback,
          ...STUDENT_PROPS
        });

        expect(wrapper.find(Comment)).to.have.lengthOf(0);
      });

      it('does not render submit button', () => {
        const wrapper = setUp({latestFeedback: FEEDBACK, ...STUDENT_PROPS});
        expect(wrapper.find('Button')).to.have.lengthOf(0);
      });

      it('renders ReadOnlyReviewState with expected props - keepWorking', () => {
        const latestFeedback = {
          ...FEEDBACK,
          review_state: ReviewStates.keepWorking
        };
        const wrapper = setUp({latestFeedback, ...STUDENT_PROPS});
        const reviewState = wrapper.find(ReadOnlyReviewState);
        expect(reviewState).to.have.lengthOf(1);
        expect(reviewState.props().latestReviewState).to.equal(
          ReviewStates.keepWorking
        );
      });

      it('renders ReadOnlyReviewState with expected props - awaiting Review', () => {
        const latestFeedback = {
          ...FEEDBACK,
          is_awaiting_teacher_review: true
        };
        const wrapper = setUp({latestFeedback, ...STUDENT_PROPS});
        const reviewState = wrapper.find(ReadOnlyReviewState);
        expect(reviewState).to.have.lengthOf(1);
        expect(reviewState.props().latestReviewState).to.equal(
          ReviewStates.awaitingReview
        );
      });
    });
  });
});
