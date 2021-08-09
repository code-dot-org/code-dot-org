import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {mount} from 'enzyme';
import ProgressTableSummaryCell, {
  unitTestExports
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryCell';
import color from '@cdo/apps/util/color';
import sinon from 'sinon';
import _ from 'lodash';

const DEFAULT_PROPS = {
  studentId: 1,
  studentLessonProgress: {
    completedPercent: 100,
    imperfectPercent: 0,
    incompletePercent: 0,
    timeSpent: 0,
    lastTimestamp: 0
  },
  isAssessmentLesson: false,
  onSelectDetailView: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = _.merge(_.cloneDeep(DEFAULT_PROPS), overrideProps);
  return mount(<ProgressTableSummaryCell {...props} />).find(
    unitTestExports.BorderedBox
  );
};

const getStyle = (wrapper, styleName) => {
  return wrapper.props().style[styleName];
};

describe('ProgressTableSummaryCell', () => {
  it('displays as not started when missing progress data', () => {
    const wrapper = setUp({studentLessonProgress: null});
    expect(wrapper.props().borderColor).to.equal(color.light_gray);
  });

  it('calls onSelectDetailView when clicked', () => {
    const onClickSpy = sinon.spy();
    const wrapper = setUp({onSelectDetailView: onClickSpy});
    wrapper.simulate('click');
    expect(onClickSpy).to.have.been.called;
  });

  it('displays border as color.light_gray when a lesson has not been started', () => {
    const wrapper = setUp({studentLessonProgress: null});
    expect(wrapper.props().borderColor).to.equal(color.light_gray);
  });

  it('displays border as color.level_perfect when a lesson has been started and not isAssessmentLesson', () => {
    const studentLessonProgress = {isStarted: true};
    const wrapper = setUp({isAssessmentLesson: false, studentLessonProgress});
    expect(wrapper.props().borderColor).to.equal(color.level_perfect);
  });

  it('displays border as color.level_submitted when a lesson has been started and is isAssessmentLesson', () => {
    const studentLessonProgress = {isStarted: true};
    const wrapper = setUp({isAssessmentLesson: true, studentLessonProgress});
    expect(wrapper.props().borderColor).to.equal(color.level_submitted);
  });

  it('displays incomplete portion as a percent in color.level_not_tried', () => {
    const studentLessonProgress = {
      isStarted: true,
      completedPercent: 25,
      imperfectPercent: 0,
      incompletePercent: 75
    };
    const wrapper = setUp({studentLessonProgress});
    const incompletePortion = wrapper.childAt(0).childAt(0);

    const backgroundColor = getStyle(incompletePortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_not_tried);

    const height = getStyle(incompletePortion, 'height');
    expect(height).to.equal('75%');
  });

  it('displays imperfect portion as a percent in color.level_passed', () => {
    const studentLessonProgress = {
      isStarted: true,
      completedPercent: 25,
      imperfectPercent: 25,
      incompletePercent: 50
    };
    const wrapper = setUp({studentLessonProgress});
    const imperfectPortion = wrapper.childAt(0).childAt(1);

    const backgroundColor = getStyle(imperfectPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_passed);

    const height = getStyle(imperfectPortion, 'height');
    expect(height).to.equal('25%');
  });

  it('displays completed portion as a percent in color.level_submitted if it is isAssessmentLesson', () => {
    const studentLessonProgress = {
      isStarted: true,
      completedPercent: 25,
      imperfectPercent: 25,
      incompletePercent: 50
    };
    const wrapper = setUp({isAssessmentLesson: true, studentLessonProgress});
    const completedPortion = wrapper.childAt(0).childAt(2);

    const backgroundColor = getStyle(completedPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_submitted);

    const height = getStyle(completedPortion, 'height');
    expect(height).to.equal('25%');
  });

  it('displays completed portion as a percent in color.level_perfect if it is not isAssessmentLesson', () => {
    const studentLessonProgress = {
      isStarted: true,
      completedPercent: 25,
      imperfectPercent: 25,
      incompletePercent: 50
    };
    const wrapper = setUp({isAssessmentLesson: false, studentLessonProgress});
    const completedPortion = wrapper.childAt(0).childAt(2);

    const backgroundColor = getStyle(completedPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_perfect);

    const height = getStyle(completedPortion, 'height');
    expect(height).to.equal('25%');
  });
});
