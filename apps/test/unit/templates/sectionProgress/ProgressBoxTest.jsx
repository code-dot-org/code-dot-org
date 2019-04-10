import React from 'react';
import {assert} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import ProgressBox from '@cdo/apps/templates/sectionProgress/ProgressBox';
import color from '@cdo/apps/util/color';
import experiments from '@cdo/apps/util/experiments';

const DEFAULT_PROPS = {
  started: true,
  incomplete: 2,
  imperfect: 0,
  perfect: 2,
  style: {},
  stageIsAllAssessment: false
};

describe('ProgressBox', () => {
  it('renders progress bar as green when stageIsAllAssessment prop is false', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(<ProgressBox {...DEFAULT_PROPS} />);
    assert.equal(
      wrapper
        .find('.uitest-perfect-bar')
        .first()
        .props().style.backgroundColor,
      color.level_perfect
    );
    experiments.isEnabled.restore();
  });

  it('renders progress bar as purple when stageIsAllAssessment prop is true and in experiment', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(
      <ProgressBox {...DEFAULT_PROPS} stageIsAllAssessment={true} />
    );
    assert.equal(
      wrapper
        .find('.uitest-perfect-bar')
        .first()
        .props().style.backgroundColor,
      color.level_submitted
    );
    experiments.isEnabled.restore();
  });

  it('renders progress bar as green when stageIsAllAssessment prop is true and not in experiment', () => {
    sinon.stub(experiments, 'isEnabled').returns(false);
    const wrapper = shallow(
      <ProgressBox {...DEFAULT_PROPS} stageIsAllAssessment={true} />
    );
    assert.equal(
      wrapper
        .find('.uitest-perfect-bar')
        .first()
        .props().style.backgroundColor,
      color.level_perfect
    );
    experiments.isEnabled.restore();
  });
});
