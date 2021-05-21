import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTeacherFeedback as TeacherFeedback} from '@cdo/apps/templates/instructions/TeacherFeedback';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const TEACHER_FEEDBACK_NO_RUBRIC_PROPS = {
  user: 5,
  disabledMode: false,
  rubric: null,
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: false,
  latestFeedback: null
};
const TEACHER_NOT_FEEDBACK_RUBRIC_PROPS = {
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
  displayKeyConcept: true,
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
  displayKeyConcept: false,
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
  displayKeyConcept: false,
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
  displayKeyConcept: true,
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
  displayKeyConcept: false,
  latestFeedback: null
};

describe('TeacherFeedback', () => {
  it('does not display tab content if it is not currently visible', () => {
    const wrapper = shallow(
      <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} visible={false} />
    );
    expect(
      wrapper
        .find('div')
        .first()
        .props().style.display
    ).to.equal('none');
  });

  describe('viewed as Teacher', () => {
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

      const statusComponent = wrapper.find('TeacherFeedbackStatus');
      expect(statusComponent).to.have.length(1);
      expect(statusComponent.props().viewAs).to.equal('Teacher');
      expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
    });

    it('does not display TeacherFeedbackStatus if there is no latestFeedback', () => {
      const props = {
        ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
        latestFeedback: null
      };

      const wrapper = shallow(<TeacherFeedback {...props} />);
      expect(wrapper.find('TeacherFeedbackStatus')).to.have.length(0);
    });

    it('shows the correct components if teacher is giving feedback, on a level with a rubric, with no previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        TEACHER_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().displayKeyConcept).to.equal(false);
      expect(rubric.props().disabledMode).to.equal(false);
      expect(rubric.props().viewAs).to.equal(ViewType.Teacher);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(false);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(false);
      expect(confirmCommentArea.props().comment).to.equal('');

      // Submit Feedback
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).to.equal(true);
      expect(confirmButton.props().text).to.equal('Save and share');
    });

    it('shows the correct components if teacher is giving feedback, on a level with a rubric, with previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback
          {...TEACHER_FEEDBACK_RUBRIC_PROPS}
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

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(false);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(false);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');

      // Submit Feedback
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).to.equal(true);
      expect(confirmButton.props().text).to.equal('Update');
    });

    it('shows the correct components if teacher is not giving feedback, on a level with a rubric', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_NOT_FEEDBACK_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        TEACHER_NOT_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().displayKeyConcept).to.equal(true);
      expect(rubric.props().disabledMode).to.equal(true);

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if teacher is giving feedback, on a level with no rubric, with no previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_FEEDBACK_NO_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      expect(wrapper.find('TeacherFeedbackRubric')).to.have.lengthOf(0);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(false);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(false);
      expect(confirmCommentArea.props().comment).to.equal('');

      // Submit Feedback
      const confirmButton = wrapper.find('Button').first();
      expect(confirmButton.props().disabled).to.equal(true);
      expect(confirmButton.props().text).to.equal('Save and share');
    });
  });

  describe('viewed as a Student', () => {
    it('displays TeacherFeedbackStatus if latestFeedback exists', () => {
      const latestFeedback = {
        student_seen_feedback: new Date(),
        comment: 'Great!'
      };

      const props = {
        ...STUDENT_FEEDBACK_RUBRIC_PROPS,
        latestFeedback
      };

      const wrapper = shallow(<TeacherFeedback {...props} />);

      const statusComponent = wrapper.find('TeacherFeedbackStatus');
      expect(statusComponent).to.have.length(1);
      expect(statusComponent.props().viewAs).to.equal('Student');
      expect(statusComponent.props().latestFeedback).to.equal(latestFeedback);
    });

    it('does not display TeacherFeedbackStatus if there is no latestFeedback', () => {
      const props = {
        ...STUDENT_FEEDBACK_RUBRIC_PROPS,
        latestFeedback: null
      };

      const wrapper = shallow(<TeacherFeedback {...props} />);
      expect(wrapper.find('TeacherFeedbackStatus')).to.have.length(0);
    });

    it('shows the correct components if student is on a level with a rubric, where no feedback has been given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        STUDENT_NO_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().displayKeyConcept).to.equal(true);
      expect(rubric.props().disabledMode).to.equal(true);
      expect(rubric.props().viewAs).to.equal(ViewType.Student);

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if student is on a level with no rubric, where a comment was given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback
          {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS}
          latestFeedback={{
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: null,
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }}
        />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      expect(wrapper.find('TeacherFeedbackRubric')).to.have.lengthOf(0);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(true);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(true);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if student is on a level with a rubric, where a comment was given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback
          {...STUDENT_FEEDBACK_RUBRIC_PROPS}
          latestFeedback={{
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: null,
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }}
        />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        STUDENT_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().displayKeyConcept).to.equal(false);
      expect(rubric.props().disabledMode).to.equal(true);
      expect(rubric.props().viewAs).to.equal(ViewType.Student);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(true);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(true);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if student is on a level with a rubric, where a comment and performance level was given by the teacher', () => {
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

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        STUDENT_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().performance).to.equal('performanceLevel2');
      expect(rubric.props().displayKeyConcept).to.equal(false);
      expect(rubric.props().disabledMode).to.equal(true);
      expect(rubric.props().viewAs).to.equal(ViewType.Student);

      // Comment
      const confirmCommentArea = wrapper.find('CommentArea').first();
      expect(confirmCommentArea.props().disabledMode).to.equal(true);
      expect(confirmCommentArea.props().studentHasFeedback).to.equal(true);
      expect(confirmCommentArea.props().comment).to.equal('Good work!');

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if student is on a level with a rubric, where a performance level was given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback
          {...STUDENT_FEEDBACK_RUBRIC_PROPS}
          latestFeedback={{
            comment: '',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'performanceLevel2',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }}
        />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Rubric
      const rubric = wrapper.find('TeacherFeedbackRubric');
      expect(rubric).to.have.length(1);
      expect(rubric.props().rubric).to.equal(
        STUDENT_FEEDBACK_RUBRIC_PROPS.rubric
      );
      expect(rubric.props().performance).to.equal('performanceLevel2');
      expect(rubric.props().displayKeyConcept).to.equal(false);
      expect(rubric.props().disabledMode).to.equal(true);
      expect(rubric.props().viewAs).to.equal(ViewType.Student);

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
  });
});
