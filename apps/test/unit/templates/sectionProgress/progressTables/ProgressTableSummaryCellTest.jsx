import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableSummaryCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableSummaryCell';
import color from '@cdo/apps/util/color';
import sinon from 'sinon';

const DEFAULT_PROPS = {
  studentId: 1,
  statusPercents: {
    attempted: 0,
    completed: 100,
    imperfect: 0,
    incomplete: 0
  },
  assessmentStage: false,
  onSelectDetailView: () => {}
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableSummaryCell {...props} />);
};

const getStyle = (wrapper, styleName) => {
  return wrapper.props().style[styleName];
};

describe('ProgressTableSummaryCell', () => {
  it('calls onSelectDetailView when clicked', () => {
    const onClickSpy = sinon.spy();
    const wrapper = setUp({onSelectDetailView: onClickSpy});
    wrapper.simulate('click');
    expect(onClickSpy).to.have.been.called;
  });

  it('displays border as color.light_gray when a lesson has not been started', () => {
    const statusPercents = {
      attempted: 0,
      completed: 0,
      imperfect: 0,
      incomplete: 100
    };
    const wrapper = setUp({statusPercents});
    const borderColor = getStyle(wrapper, 'borderColor');
    expect(borderColor).to.equal(color.light_gray);
  });

  it('displays border as color.level_perfect when a lesson has been started and not assessmentStage', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 0,
      incomplete: 75
    };
    const wrapper = setUp({assessmentStage: false, statusPercents});
    const borderColor = getStyle(wrapper, 'borderColor');
    expect(borderColor).to.equal(color.level_perfect);
  });

  it('displays border as color.level_submitted when a lesson has been started and is assessmentStage', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 0,
      incomplete: 75
    };
    const wrapper = setUp({assessmentStage: true, statusPercents});
    const borderColor = getStyle(wrapper, 'borderColor');
    expect(borderColor).to.equal(color.level_submitted);
  });

  it('displays incomplete portion as a percent in color.level_not_tried', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 0,
      incomplete: 75
    };
    const wrapper = setUp({statusPercents});
    const incompletePortion = wrapper.childAt(0);

    const backgroundColor = getStyle(incompletePortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_not_tried);

    const height = getStyle(incompletePortion, 'height');
    expect(height).to.equal('75%');
  });

  it('displays imperfect portion as a percent in color.level_passed', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 25,
      incomplete: 50
    };
    const wrapper = setUp({statusPercents});
    const imperfectPortion = wrapper.childAt(1);

    const backgroundColor = getStyle(imperfectPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_passed);

    const height = getStyle(imperfectPortion, 'height');
    expect(height).to.equal('25%');
  });

  it('displays completed portion as a percent in color.level_submitted if it is assessmentStage', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 25,
      incomplete: 50
    };
    const wrapper = setUp({assessmentStage: true, statusPercents});
    const completedPortion = wrapper.childAt(2);

    const backgroundColor = getStyle(completedPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_submitted);

    const height = getStyle(completedPortion, 'height');
    expect(height).to.equal('25%');
  });

  it('displays completed portion as a percent in color.level_perfect if it is not assessmentStage', () => {
    const statusPercents = {
      attempted: 0,
      completed: 25,
      imperfect: 25,
      incomplete: 50
    };
    const wrapper = setUp({assessmentStage: false, statusPercents});
    const completedPortion = wrapper.childAt(2);

    const backgroundColor = getStyle(completedPortion, 'backgroundColor');
    expect(backgroundColor).to.equal(color.level_perfect);

    const height = getStyle(completedPortion, 'height');
    expect(height).to.equal('25%');
  });
});
