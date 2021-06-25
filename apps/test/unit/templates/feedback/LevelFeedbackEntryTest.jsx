import React from 'react';
import {shallow, mount} from 'enzyme';
import {expect} from '../../../util/deprecatedChai';
import LevelFeedbackEntry from '@cdo/apps/templates/feedback/LevelFeedbackEntry';
import {UnlocalizedTimeAgo as TimeAgo} from '@cdo/apps/templates/TimeAgo';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';
import ReactDOM from 'react-dom';
import sinon from 'sinon';

const DEFAULT_FEEDBACK = {
  seen_on_feedback_page_at: null,
  student_first_visited_at: null,
  lessonName: 'A Lesson',
  lessonNum: 1,
  levelNum: 5,
  linkToLevel: '/link-to-level',
  unitName: 'A Unit',
  created_at: new Date(),
  comment: 'Great Work',
  performance: 'performanceLevel1'
};

const setUp = (overrideFeedback, useMount = false) => {
  const props = {
    feedback: {...DEFAULT_FEEDBACK, ...overrideFeedback}
  };
  return useMount
    ? mount(<LevelFeedbackEntry {...props} />)
    : shallow(<LevelFeedbackEntry {...props} />);
};

describe('LevelFeedbackEntry', () => {
  it('displays the expected header', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Lesson 1: Level 5')).to.be.true;
  });

  it('displays the unit name', () => {
    const wrapper = setUp();
    expect(wrapper.contains('A Unit')).to.be.true;
  });

  it('displays the created date', () => {
    const createdDate = new Date();
    const wrapper = setUp({created_at: createdDate});
    const timeAgoComponent = wrapper.find(TimeAgo);
    expect(timeAgoComponent).to.have.length(1);
    expect(timeAgoComponent.props().dateString).to.equal(createdDate);
  });

  it('displays background as white if student has not seed feedback', () => {
    const wrapper = setUp();
    expect(wrapper.first().props().style.backgroundColor).to.equal(color.white);
  });

  it('displays background as gray if student has seen feedback', () => {
    const wrapper = setUp({
      student_first_visited_at: new Date().toString(),
      seen_on_feedback_page_at: new Date().toString()
    });
    expect(wrapper.first().props().style.backgroundColor).to.equal(
      color.background_gray
    );
  });

  it('displays performance copy if performance value exists', () => {
    const wrapper = setUp();
    expect(wrapper.contains(i18n.feedbackRubricEvaluation())).to.be.true;
    expect(wrapper.contains(i18n.rubricLevelOneHeader())).to.be.true;
  });

  it('does not display performance copy if value does not exist', () => {
    const wrapper = setUp({performance: null});
    expect(wrapper.contains(i18n.feedbackRubricEvaluation())).to.be.false;
  });

  it('displays the comment if there is a comment', () => {
    const wrapper = setUp();
    expect(wrapper.contains('Great Work')).to.be.true;
  });

  it('hides the comment expander if the comment is not long', () => {
    sinon.stub(ReactDOM, 'findDOMNode').returns({offsetHeight: 20});
    const wrapper = setUp({}, true);
    expect(wrapper.find({icon: 'caret-right'})).have.length(0);
    ReactDOM.findDOMNode.restore();
  });

  it('displays the comment expander if the comment is long', () => {
    sinon.stub(ReactDOM, 'findDOMNode').returns({offsetHeight: 60});
    const wrapper = setUp({}, true);
    expect(wrapper.find({icon: 'caret-right'})).to.have.length(1);
    ReactDOM.findDOMNode.restore();
  });

  it('displays the fade if the comment is long (and collapsed)', () => {
    sinon.stub(ReactDOM, 'findDOMNode').returns({offsetHeight: 60});
    const wrapper = setUp({}, true);
    expect(wrapper.find('#comment-fade')).to.have.length(1);
    ReactDOM.findDOMNode.restore();
  });
});
