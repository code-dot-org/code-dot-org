import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTeacherFeedback as TeacherFeedback} from '@cdo/apps/templates/instructions/TeacherFeedback';

const TEACHER_FEEDBACK_NO_RUBRIC_PROPS = {
  user: 5,
  disabledMode: false,
  rubric: null,
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: false
};
const TEACHER_NOT_FEEDBACK_RUBRIC_PROPS = {
  user: 5,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    exceeds: 'exceeded expectations',
    meets: 'met expectations',
    approaches: 'approaches expectations',
    noEvidence: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: true
};

const TEACHER_FEEDBACK_RUBRIC_PROPS = {
  user: 5,
  disabledMode: false,
  rubric: {
    keyConcept: 'This is the Key Concept',
    exceeds: 'exceeded expectations',
    meets: 'met expectations',
    approaches: 'approaches expectations',
    noEvidence: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Teacher',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: false
};

const STUDENT_FEEDBACK_NO_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: null,
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: false
};
const STUDENT_NO_FEEDBACK_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    exceeds: 'exceeded expectations',
    meets: 'met expectations',
    approaches: 'approaches expectations',
    noEvidence: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: true
};

const STUDENT_FEEDBACK_RUBRIC_PROPS = {
  user: 1,
  disabledMode: true,
  rubric: {
    keyConcept: 'This is the Key Concept',
    exceeds: 'exceeded expectations',
    meets: 'met expectations',
    approaches: 'approaches expectations',
    noEvidence: 'no evidence of trying'
  },
  visible: true,
  viewAs: 'Student',
  serverLevelId: 123,
  teacher: 5,
  displayKeyConcept: false
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
    it('shows the correct components if teacher is giving feedback, on a level with a rubric, with no previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
      );

      // No past feedback
      wrapper.setState({
        comment: '',
        performance: null,
        studentId: 1,
        latestFeedback: [],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').first();
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(false);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        true
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(false);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('exceeds');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'exceeded expectations'
      );
      wrapper.find('RubricField').forEach(node => {
        expect(node.props().currentlyChecked).to.equal(false);
      });

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
        <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
      );

      // Previous Feedback
      wrapper.setState({
        comment: 'Good work!',
        performance: 'meets',
        studentId: 1,
        latestFeedback: [
          {
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'meets',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }
        ],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(false);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        true
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(false);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('meets');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmExceedsRatioButton.props().currentlyChecked).to.equal(true);

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

      // No past feedback
      wrapper.setState({
        comment: '',
        performance: null,
        studentId: 1,
        latestFeedback: [],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').first();
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(true);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        false
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(true);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('exceeds');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'exceeded expectations'
      );

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });

    it('shows the correct components if teacher is giving feedback, on a level with no rubric, with no previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_FEEDBACK_NO_RUBRIC_PROPS} />
      );

      // No past feedback
      wrapper.setState({
        comment: '',
        performance: null,
        studentId: 1,
        latestFeedback: [],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(false);
      expect(wrapper.contains('This is the Key Concept')).to.equal(false);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(0);

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
    it('shows the correct components if student is on a level with a rubric, where no feedback has been given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      // Student Has Feedback
      wrapper.setState({
        comment: '',
        performance: null,
        studentId: 1,
        latestFeedback: [],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(true);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        false
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(true);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('meets');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
    it('shows the correct components if student is on a level with no rubric, where a comment was given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback {...STUDENT_FEEDBACK_NO_RUBRIC_PROPS} />
      );

      // Student Has Feedback
      wrapper.setState({
        comment: 'Good work!',
        performance: null,
        studentId: 1,
        latestFeedback: [
          {
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'meets',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }
        ],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(false);
      expect(wrapper.contains('This is the Key Concept')).to.equal(false);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(0);

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
        <TeacherFeedback {...STUDENT_FEEDBACK_RUBRIC_PROPS} />
      );

      // Student Has Feedback
      wrapper.setState({
        comment: 'Good work!',
        performance: null,
        studentId: 1,
        latestFeedback: [
          {
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'meets',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }
        ],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(true);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        false
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(false);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('meets');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );

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
        <TeacherFeedback {...STUDENT_FEEDBACK_RUBRIC_PROPS} />
      );

      // Student Has Feedback
      wrapper.setState({
        comment: 'Good work!',
        performance: 'meets',
        studentId: 1,
        latestFeedback: [
          {
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'meets',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }
        ],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(true);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        true
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(false);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('meets');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmExceedsRatioButton.props().currentlyChecked).to.equal(true);

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
        <TeacherFeedback {...STUDENT_FEEDBACK_RUBRIC_PROPS} />
      );

      // Student Has Feedback
      wrapper.setState({
        comment: '',
        performance: 'meets',
        studentId: 1,
        latestFeedback: [
          {
            comment: 'Good work!',
            created_at: '2019-03-26T19:56:53.000Z',
            id: 5,
            level_id: 123,
            performance: 'meets',
            student_id: 1,
            teacher_name: 'Tim The Teacher'
          }
        ],
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmExceedsRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmExceedsRatioButton.props().disabledMode).to.equal(true);
      expect(confirmExceedsRatioButton.props().showFeedbackInputAreas).to.equal(
        true
      );
      expect(confirmExceedsRatioButton.props().expandByDefault).to.equal(false);
      expect(confirmExceedsRatioButton.props().rubricLevel).to.equal('meets');
      expect(confirmExceedsRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmExceedsRatioButton.props().currentlyChecked).to.equal(true);

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
  });
});
