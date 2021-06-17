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

const TEACHER_FEEDBACK_NO_RUBRIC_PROPS = {
  user: 5,
  disabledMode: false,
  rubric: null,
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: false,
  latestFeedback: null
};

const TEACHER_NO_FEEDBACK_RUBRIC_PROPS = {
  user: 5,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: true,
  latestFeedback: null
};

const TEACHER_FEEDBACK_RUBRIC_PROPS = {
  user: 5,
  disabledMode: false,
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: false,
  latestFeedback: null
};

const STUDENT_FEEDBACK_NO_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: null,
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: false,
  latestFeedback: []
};

const STUDENT_NO_FEEDBACK_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: true,
  latestFeedback: null
};

const STUDENT_FEEDBACK_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    performanceLevel1: 'exceeded expectations',
    performanceLevel2: 'met expectations',
    performanceLevel3: 'approaches expectations',
    performanceLevel4: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayReadonlyRubric: false,
  latestFeedback: null
};

describe('TeacherFeedback', () => {
  it('does not display tab content if it is not currently visible', () => {
    const wrapper = shallow(
      <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} visible={false} />
    );

    expect(wrapper.isEmptyRender()).to.be.true;
  });

  describe('viewed as Teacher - looking at student work', () => {
    describe('without previous feedback', () => {
      it('does not display TeacherFeedbackStatus', () => {
        const props = {
          ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
          latestFeedback: null
        };

        const wrapper = shallow(<TeacherFeedback {...props} />);
        expect(wrapper.find(FeedbackStatus)).to.have.length(0);
      });

      it('displays a rubric with expected props if there is a rubric', () => {
        const wrapper = shallow(
          <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
        );

        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(
          TEACHER_FEEDBACK_RUBRIC_PROPS.rubric
        );
        expect(rubric.props().isReadonly).to.equal(false);
        expect(rubric.props().disabledMode).to.equal(false);
        expect(rubric.props().viewAs).to.equal(ViewType.Teacher);
      });

      it('does not display a rubric if there is no rubric', () => {
        const wrapper = shallow(
          <TeacherFeedback {...TEACHER_FEEDBACK_NO_RUBRIC_PROPS} />
        );

        expect(wrapper.find(Rubric)).to.have.lengthOf(0);
      });

      it('displays the comment with expected props', () => {
        const wrapper = shallow(
          <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
        );

        const confirmCommentArea = wrapper.find(Comment).first();
        expect(confirmCommentArea.props().isReadonly).to.equal(false);
        expect(confirmCommentArea.props().comment).to.equal('');
      });

      it('displays submit feedback button with expected text', () => {
        const wrapper = shallow(
          <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
        );

        const confirmButton = wrapper.find('Button').first();
        expect(confirmButton.props().disabled).to.equal(true);
        expect(confirmButton.props().text).to.equal('Save and share');
      });

      it('renders TeacherFeedbackKeepWorking with expected props if part of the experiment', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const wrapper = shallow(
          <TeacherFeedback {...TEACHER_FEEDBACK_NO_RUBRIC_PROPS} />
        );

        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(1);
        expect(keepWorkingComponent.props().latestReviewState).to.equal(null);
        expect(keepWorkingComponent.props().isAwaitingTeacherReview).to.be
          .false;

        experiments.isEnabled.restore();
      });
    });

    describe('with previous feedback given', () => {
      const feedback = {
        comment: 'Good work!',
        created_at: '2019-03-26T19:56:53.000Z',
        id: 5,
        level_id: 123,
        performance: null,
        student_id: 1,
        teacher_name: 'Tim The Teacher'
      };

      it('displays TeacherFeedbackStatus if latestFeedback exists', () => {
        const latestFeedback = {
          feedback_provider_id: 5,
          student_seen_feedback: new Date()
        };

        const props = {
          ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
          latestFeedback
        };

        const wrapper = shallow(<TeacherFeedback {...props} />);

        const statusComponent = wrapper.find(FeedbackStatus);
        expect(statusComponent).to.have.length(1);
        expect(statusComponent.props().viewAs).to.equal('Teacher');
        expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
      });

      it('displays the rubric if there is a rubric', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...TEACHER_FEEDBACK_RUBRIC_PROPS}
            latestFeedback={{
              ...feedback,
              performance: 'performanceLevel2'
            }}
          />
        );

        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
      });

      it('renders comment with expected props', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...TEACHER_FEEDBACK_RUBRIC_PROPS}
            latestFeedback={feedback}
          />
        );

        const confirmCommentArea = wrapper.find(Comment).first();
        expect(confirmCommentArea.props().isReadonly).to.equal(false);
        expect(confirmCommentArea.props().comment).to.equal('Good work!');
      });

      it('displays submit button with expected text', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...TEACHER_FEEDBACK_RUBRIC_PROPS}
            latestFeedback={feedback}
          />
        );

        const confirmButton = wrapper.find('Button').first();
        expect(confirmButton.props().disabled).to.equal(true);
        expect(confirmButton.props().text).to.equal('Update');
      });

      it('renders TeacherFeedbackKeepWorking with expected props if part of the experiment', () => {
        sinon.stub(experiments, 'isEnabled').returns(true);

        const wrapper = shallow(
          <TeacherFeedback
            {...TEACHER_FEEDBACK_NO_RUBRIC_PROPS}
            latestFeedback={{...feedback, review_state: 'completed'}}
          />
        );

        const keepWorkingComponent = wrapper.find(EditableReviewState);
        expect(keepWorkingComponent).to.have.length(1);
        expect(keepWorkingComponent.props().latestReviewState).to.equal(
          'completed'
        );
        expect(keepWorkingComponent.props().isAwaitingTeacherReview).to.be
          .false;

        experiments.isEnabled.restore();
      });
    });
  });

  describe('viewed as teacher - not looking at student work', () => {
    it('displays readonly rubric if rubric exists for level', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      const rubric = wrapper.find(Rubric);
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        TEACHER_NO_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().isReadonly).to.equal(true);
      expect(rubric.props().disabledMode).to.equal(true);
    });

    it('does not display comment area', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      expect(wrapper.find(Comment)).to.have.lengthOf(0);
    });

    it('does not display submit button', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
  });

  describe('viewed as a Student', () => {
    describe('without previous feedback given', () => {
      it('does not display TeacherFeedbackStatus', () => {
        const props = {
          ...STUDENT_FEEDBACK_RUBRIC_PROPS,
          latestFeedback: null
        };

        const wrapper = shallow(<TeacherFeedback {...props} />);
        expect(wrapper.find(FeedbackStatus)).to.have.length(0);
      });

      it('displays rubric with expected props if there is a rubric', () => {
        const wrapper = shallow(
          <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
        );

        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(
          STUDENT_NO_FEEDBACK_RUBRIC_PROPS.rubric
        );
        expect(rubric.props().isReadonly).to.equal(true);
        expect(rubric.props().disabledMode).to.equal(true);
        expect(rubric.props().viewAs).to.equal(ViewType.Student);
      });

      it('does not display the comment area', () => {
        const wrapper = shallow(
          <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
        );

        expect(wrapper.find(Comment)).to.have.lengthOf(0);
      });

      it('does not display the submit feedback button', () => {
        const wrapper = shallow(
          <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
        );

        expect(wrapper.find('Button')).to.have.lengthOf(0);
      });

      it('does not display FeedbackStudentReviewState', () => {
        const wrapper = shallow(
          <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
        );

        expect(wrapper.find(ReadOnlyReviewState)).to.have.lengthOf(0);
      });
    });

    describe('with previous feedback given', () => {
      const feedback = {
        comment: 'Good work!',
        created_at: '2019-03-26T19:56:53.000Z',
        id: 5,
        level_id: 123,
        performance: null,
        student_id: 1,
        teacher_name: 'Tim The Teacher'
      };

      it('displays TeacherFeedbackStatus', () => {
        const latestFeedback = {
          student_seen_feedback: new Date(),
          comment: 'Great!'
        };

        const props = {
          ...STUDENT_FEEDBACK_RUBRIC_PROPS,
          latestFeedback
        };

        const wrapper = shallow(<TeacherFeedback {...props} />);

        const statusComponent = wrapper.find(FeedbackStatus);
        expect(statusComponent).to.have.length(1);
        expect(statusComponent.props().viewAs).to.equal('Student');
        expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
      });

      it('does not render rubric if there is no rubric for the level', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS}
            latestFeedback={feedback}
          />
        );

        expect(wrapper.find(Rubric)).to.have.lengthOf(0);
      });

      it('renders rubric with expected props if there is a rubric for the level', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_RUBRIC_PROPS}
            latestFeedback={{
              comment: 'Good work!',
              created_at: '2019-03-26T19:56:53.000Z',
              id: 5,
              level_id: 123,
              performance: 'performanceLevel2',
              student_id: 1,
              teacher_name: 'Tim The Teacher'
            }}
          />
        );

        const rubric = wrapper.find(Rubric);
        expect(rubric).to.have.length(1);
        expect(rubric.props().rubric).to.equal(
          STUDENT_FEEDBACK_RUBRIC_PROPS.rubric
        );
        expect(rubric.props().performance).to.equal('performanceLevel2');
        expect(rubric.props().isReadonly).to.equal(false);
        expect(rubric.props().disabledMode).to.equal(true);
        expect(rubric.props().viewAs).to.equal(ViewType.Student);
      });

      it('renders the comment with expected props if there is a comment', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS}
            latestFeedback={feedback}
          />
        );

        const confirmCommentArea = wrapper.find(Comment).first();
        expect(confirmCommentArea.props().isReadonly).to.equal(true);
        expect(confirmCommentArea.props().comment).to.equal('Good work!');
      });

      it('does not render a comment if no comment was given with feedback', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_RUBRIC_PROPS}
            latestFeedback={{
              ...feedback,
              comment: '',
              performance: 'performanceLevel2'
            }}
          />
        );

        expect(wrapper.find(Comment)).to.have.lengthOf(0);
      });

      it('does not render submit button', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS}
            latestFeedback={feedback}
          />
        );

        expect(wrapper.find('Button')).to.have.lengthOf(0);
      });

      it('renders FeedbackStudentReviewState with expected props', () => {
        const wrapper = shallow(
          <TeacherFeedback
            {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS}
            latestFeedback={{...feedback, review_state: 'keepWorking'}}
          />
        );

        const reviewState = wrapper.find(ReadOnlyReviewState);
        expect(reviewState).to.have.lengthOf(1);
        expect(reviewState.props().latestReviewState).to.equal('keepWorking');
      });
    });
  });
});
