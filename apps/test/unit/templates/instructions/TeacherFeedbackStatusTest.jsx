import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import TeacherFeedbackStatus from '@cdo/apps/templates/instructions/TeacherFeedbackStatus';
import moment from 'moment/moment';

const setUp = (latestFeedback, viewAs = ViewType.Teacher) => {
  const props = {latestFeedback, viewAs};
  return shallow(<TeacherFeedbackStatus {...props} />);
};

describe('TeacherFeedbackStatusText', () => {
  describe('viewed as Teacher', () => {
    it('displays nicely formatted date with checkmark icon if student viewed teacher feedback today', () => {
      const today = new Date();

      const latestFeedback = {
        student_seen_feedback: today
      };

      const wrapper = setUp(latestFeedback);
      expect(wrapper.find('FontAwesome').props().icon).to.equal('check');
      expect(wrapper.contains('Seen by student')).to.be.true;
      expect(wrapper.contains('today')).to.be.true;
    });

    it('displays nicely formatted date if student viewed teacher feedback yesterday', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const latestFeedback = {
        student_seen_feedback: yesterday
      };

      const wrapper = setUp(latestFeedback);
      expect(wrapper.find('FontAwesome').props().icon).to.equal('check');
      expect(wrapper.contains('Seen by student')).to.be.true;
      expect(wrapper.contains('yesterday')).to.be.true;
    });

    it('displays nicely formatted date if student viewed teacher feedback two days ago', () => {
      const twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

      const latestFeedback = {
        student_seen_feedback: twoDaysAgo
      };

      const wrapper = setUp(latestFeedback);
      expect(wrapper.find('FontAwesome').props().icon).to.equal('check');

      const formattedDate = moment(twoDaysAgo).format('l');
      expect(wrapper.contains('Seen by student')).to.be.true;
      expect(wrapper.contains(formattedDate)).to.be.true;
    });

    it('displays nicely formatted date if student updated their progress since feedback was left', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const latestFeedback = {
        created_at: yesterday,
        student_last_updated: new Date()
      };

      const wrapper = setUp(latestFeedback);
      expect(wrapper.contains('Last updated by student')).to.be.true;
      expect(wrapper.contains('today')).to.be.true;
    });

    it('displays correct message if student has not viewed their feedback', () => {
      const today = new Date();
      const latestFeedback = {student_seen_feedback: null, updated_at: today};

      const wrapper = setUp(latestFeedback);
      expect(wrapper.contains('Updated by you')).to.be.true;
      expect(wrapper.contains('today')).to.be.true;
    });
  });

  describe('viewed as a Student', () => {
    it('with feedback displays lastUpdated message', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const latestFeedback = {
        created_at: yesterday,
        comment: 'Great!'
      };

      const wrapper = setUp(latestFeedback, ViewType.Student);
      expect(wrapper.contains('Last updated')).to.be.true;
      expect(wrapper.contains('a day ago')).to.be.true;
    });
  });
});
