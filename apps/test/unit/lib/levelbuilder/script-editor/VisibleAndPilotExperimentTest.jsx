import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import VisibleAndPilotExperiment from '@cdo/apps/lib/levelbuilder/script-editor/VisibleAndPilotExperiment';
import sinon from 'sinon';

describe('VisibleAndPilotExperiment', () => {
  let defaultProps, updateVisible, updatePilotExperiment;

  beforeEach(() => {
    updateVisible = sinon.spy();
    updatePilotExperiment = sinon.spy();
    defaultProps = {
      visible: true,
      updatePilotExperiment,
      updateVisible,
      pilotExperiment: null
    };
  });

  it('visible is disabled and unchecked when pilotExperiment is present', () => {
    const wrapper = mount(
      <VisibleAndPilotExperiment
        {...defaultProps}
        pilotExperiment="test-pilot"
      />
    );
    const checkbox = wrapper.find('input[name="visible_to_teachers"]');
    expect(checkbox.prop('disabled')).to.be.true;
    expect(checkbox.prop('checked')).to.be.false;
  });

  it('visible updates state as pilotExperiment changes', () => {
    const wrapper = mount(<VisibleAndPilotExperiment {...defaultProps} />);
    const visibleInTeacherDashboard = () =>
      wrapper.find('input[name="visible_to_teachers"]');
    const pilotExperiment = () =>
      wrapper.find('input[name="pilot_experiment"]');

    expect(pilotExperiment().prop('value')).to.equal('');
    expect(visibleInTeacherDashboard().prop('checked')).to.be.true;
    expect(visibleInTeacherDashboard().prop('disabled')).to.be.false;

    pilotExperiment().simulate('change', {target: {value: 'test-pilot'}});
    expect(updatePilotExperiment).to.have.been.calledWith('test-pilot');

    pilotExperiment().simulate('change', {target: {value: ''}});
    expect(updatePilotExperiment).to.have.been.calledWith('');
  });
});
