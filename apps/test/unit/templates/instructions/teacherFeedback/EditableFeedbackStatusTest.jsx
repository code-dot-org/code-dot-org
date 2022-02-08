import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import EditableFeedbackStatus from '@cdo/apps/templates/instructions/teacherFeedback/EditableFeedbackStatus';
import moment from 'moment/moment';

const setUp = latestFeedback => {
  const props = {latestFeedback};
  return shallow(<EditableFeedbackStatus {...props} />);
};

describe('EditableFeedbackStatus', () => {
  it('displays nicely formatted date with checkmark icon if student viewed teacher feedback today', () => {
    const today = new Date();

    const latestFeedback = {
      student_seen_feedback: today
    };

    const wrapper = setUp(latestFeedback);
    expect(wrapper.find('FontAwesome').props().icon).to.equal('check');
    expect(wrapper.text().includes('Seen by student today')).to.be.true;
  });

  it('displays nicely formatted date if student viewed teacher feedback yesterday', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const latestFeedback = {
      student_seen_feedback: yesterday
    };

    const wrapper = setUp(latestFeedback);
    expect(wrapper.find('FontAwesome').props().icon).to.equal('check');
    expect(wrapper.text().includes('Seen by student yesterday')).to.be.true;
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
    expect(wrapper.text().includes(`Seen by student ${formattedDate}`)).to.be
      .true;
  });

  it('displays nicely formatted date if student updated their progress since feedback was left', () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const latestFeedback = {
      created_at: yesterday,
      student_last_updated: new Date()
    };

    const wrapper = setUp(latestFeedback);
    expect(wrapper.text().includes('Last updated by student today')).to.be.true;
  });

  it('displays correct message if student has not viewed their feedback', () => {
    const today = new Date();
    const latestFeedback = {student_seen_feedback: null, updated_at: today};

    const wrapper = setUp(latestFeedback);
    expect(wrapper.text().includes('Updated by you today')).to.be.true;
  });
});
