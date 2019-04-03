import React from 'react';
import sinon from 'sinon';
import experiments from '@cdo/apps/util/experiments';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import TooltipWithIcon from '@cdo/apps/templates/progress/TooltipWithIcon';

const DEFAULT_PROPS = {
  tooltipId: 'id',
  icon: 'desktop',
  text: 'Level Name',
  includeAssessmentIcon: false
};

describe('TooltipWithIcon', () => {
  it('includes the check-circle icon if level is an assessment - in experiment', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(
      <TooltipWithIcon {...DEFAULT_PROPS} includeAssessmentIcon={true} />
    );
    expect(
      wrapper
        .find('FontAwesome')
        .first()
        .props().icon
    ).to.equal('check-circle');
    experiments.isEnabled.restore();
  });
  it('does not include the check-circle icon if level is not an assessment - in experiment', () => {
    sinon.stub(experiments, 'isEnabled').returns(true);
    const wrapper = shallow(<TooltipWithIcon {...DEFAULT_PROPS} />);
    expect(
      wrapper
        .find('FontAwesome')
        .first()
        .props().icon
    ).not.to.equal('check-circle');
    experiments.isEnabled.restore();
  });
  it('does not include the check-circle icon if NOT in experiment', () => {
    sinon.stub(experiments, 'isEnabled').returns(false);
    const wrapper = shallow(<TooltipWithIcon {...DEFAULT_PROPS} />);
    expect(
      wrapper
        .find('FontAwesome')
        .first()
        .props().icon
    ).not.to.equal('check-circle');
    experiments.isEnabled.restore();
  });
});
