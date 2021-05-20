import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {UnconnectedTeacherFeedback as TeacherFeedback} from '@cdo/apps/templates/instructions/TeacherFeedback';
import i18n from '@cdo/locale';
import sinon from 'sinon';
import moment from 'moment/moment';

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
    it('displays correct message with checkmark if student has viewed their feedback', () => {
      const props = {
        ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
        latestFeedback: {
          feedback_provider_id: 5,
          student_seen_feedback: new Date()
        }
      };
      const seenByStudentSpy = sinon.spy(i18n, 'seenByStudent');
      const wrapper = shallow(<TeacherFeedback {...props} />);
      expect(wrapper.find('FontAwesome')).to.have.lengthOf(1);
      expect(wrapper.contains('today')).to.equal(true);
      expect(seenByStudentSpy).to.have.been.calledOnce;
      i18n.seenByStudent.restore();
    });

    it('displays nicely formatted date if student viewed teacher feedback', () => {
      const today = new Date();
      const props = {
        ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
        latestFeedback: {feedback_provider_id: 5, student_seen_feedback: today}
      };
      const lastSeenTodaySpy = sinon.spy(i18n, 'today');
      const wrapper = shallow(<TeacherFeedback {...props} />);
      expect(lastSeenTodaySpy).to.have.been.calledOnce;
      const lastSeenYesterdaySpy = sinon.spy(i18n, 'yesterday');
      let yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      wrapper.setState({latestFeedback: {student_seen_feedback: yesterday}});
      expect(lastSeenYesterdaySpy).to.have.been.calledOnce;
      let twoDaysAgo = new Date(yesterday);
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1);
      wrapper.setState({
        latestFeedback: {student_seen_feedback: twoDaysAgo}
      });
      const formattedDate = moment(twoDaysAgo).format('l');
      expect(wrapper.contains(formattedDate)).to.be.true;
      i18n.today.restore();
      i18n.yesterday.restore();
    });

    it('displays correct message if student has not viewed their feedback', () => {
      const props = {
        ...TEACHER_FEEDBACK_NO_RUBRIC_PROPS,
        latestFeedback: {feedback_provider_id: 5}
      };
      const lastUpdatedCurrentTeacherSpy = sinon.spy(
        i18n,
        'lastUpdatedCurrentTeacher'
      );
      shallow(<TeacherFeedback {...props} />);
      expect(lastUpdatedCurrentTeacherSpy).to.have.been.calledOnce;
      i18n.lastUpdatedCurrentTeacher.restore();
    });

    it('shows the correct components if teacher is giving feedback, on a level with a rubric, with no previous feedback', () => {
      const wrapper = shallow(
        <TeacherFeedback {...TEACHER_FEEDBACK_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').first();
      expect(confirmLevelOneRatioButton.props().disabledMode).to.equal(false);
      expect(
        confirmLevelOneRatioButton.props().showFeedbackInputAreas
      ).to.equal(true);
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(
        false
      );
      expect(confirmLevelOneRatioButton.props().rubricLevel).to.equal(
        'performanceLevel1'
      );
      expect(confirmLevelOneRatioButton.props().rubricValue).to.equal(
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

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmLevelOneRatioButton.props().disabledMode).to.equal(false);
      expect(
        confirmLevelOneRatioButton.props().showFeedbackInputAreas
      ).to.equal(true);
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(
        false
      );
      expect(confirmLevelOneRatioButton.props().rubricLevel).to.equal(
        'performanceLevel2'
      );
      expect(confirmLevelOneRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmLevelOneRatioButton.props().currentlyChecked).to.equal(
        true
      );

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

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').first();
      expect(confirmLevelOneRatioButton.props().disabledMode).to.equal(true);
      expect(
        confirmLevelOneRatioButton.props().showFeedbackInputAreas
      ).to.equal(false);
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(true);
      expect(confirmLevelOneRatioButton.props().rubricLevel).to.equal(
        'performanceLevel1'
      );
      expect(confirmLevelOneRatioButton.props().rubricValue).to.equal(
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

      wrapper.setState({
        studentId: 1,
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
    it('with feedback displays lastUpdated message', () => {
      const props = {
        ...STUDENT_FEEDBACK_RUBRIC_PROPS,
        latestFeedback: {student_seen_feedback: new Date(), comment: 'Great!'}
      };
      const lastUpdatedSpy = sinon.spy(i18n, 'lastUpdated');
      shallow(<TeacherFeedback {...props} />);
      expect(lastUpdatedSpy).to.have.been.calledOnce;
      i18n.lastUpdated.restore();
    });

    it('shows the correct components if student is on a level with a rubric, where no feedback has been given by the teacher', () => {
      const wrapper = shallow(
        <TeacherFeedback {...STUDENT_NO_FEEDBACK_RUBRIC_PROPS} />
      );

      wrapper.setState({
        studentId: 1,
        submitting: false
      });

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmLevelOneRatioButton.props().disabledMode).to.equal(true);
      expect(
        confirmLevelOneRatioButton.props().showFeedbackInputAreas
      ).to.equal(false);
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(true);
      expect(confirmLevelOneRatioButton.props().rubricLevel).to.equal(
        'performanceLevel2'
      );
      expect(confirmLevelOneRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );

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

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmLevelOneRatioButton.props().disabledMode).to.equal(true);
      expect(
        confirmLevelOneRatioButton.props().showFeedbackInputAreas
      ).to.equal(false);
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(
        false
      );
      expect(confirmLevelOneRatioButton.props().rubricLevel).to.equal(
        'performanceLevel2'
      );
      expect(confirmLevelOneRatioButton.props().rubricValue).to.equal(
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

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').at(0);
      const confirmLevelTwoRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmLevelTwoRatioButton.props().disabledMode).to.equal(true);
      expect(
        confirmLevelTwoRatioButton.props().showFeedbackInputAreas
      ).to.equal(true);

      // The rubric value that was given as feedback should be expanded
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(
        false
      );
      expect(confirmLevelTwoRatioButton.props().expandByDefault).to.equal(true);

      expect(confirmLevelTwoRatioButton.props().rubricLevel).to.equal(
        'performanceLevel2'
      );
      expect(confirmLevelTwoRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmLevelTwoRatioButton.props().currentlyChecked).to.equal(
        true
      );
      expect(confirmLevelOneRatioButton.props().currentlyChecked).to.equal(
        false
      );

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

      // Key Concept
      expect(wrapper.contains('Key Concept')).to.equal(true);
      expect(wrapper.contains('This is the Key Concept')).to.equal(true);

      // Rubric
      expect(wrapper.find('RubricField')).to.have.lengthOf(4);
      const confirmLevelOneRatioButton = wrapper.find('RubricField').at(0);
      const confirmLevelTwoRatioButton = wrapper.find('RubricField').at(1);
      expect(confirmLevelTwoRatioButton.props().disabledMode).to.equal(true);
      expect(
        confirmLevelTwoRatioButton.props().showFeedbackInputAreas
      ).to.equal(true);

      // The rubric value that was given as feedback should be expanded
      expect(confirmLevelOneRatioButton.props().expandByDefault).to.equal(
        false
      );
      expect(confirmLevelTwoRatioButton.props().expandByDefault).to.equal(true);

      expect(confirmLevelTwoRatioButton.props().rubricLevel).to.equal(
        'performanceLevel2'
      );
      expect(confirmLevelTwoRatioButton.props().rubricValue).to.equal(
        'met expectations'
      );
      expect(confirmLevelTwoRatioButton.props().currentlyChecked).to.equal(
        true
      );
      expect(confirmLevelOneRatioButton.props().currentlyChecked).to.equal(
        false
      );

      // Comment
      expect(wrapper.find('CommentArea')).to.have.lengthOf(0);

      // Submit Feedback
      expect(wrapper.find('Button')).to.have.lengthOf(0);
    });
  });
});
