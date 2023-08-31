import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';

describe('RubricFloatingActionButton', () => {
  it('begins closed when student level info is null', () => {
    const wrapper = shallow(<RubricFloatingActionButton />);
    expect(wrapper.find('RubricContainer').length).to.equal(0);
  });

  it('begins open when student level info is provided', () => {
    const wrapper = shallow(
      <RubricFloatingActionButton
        studentLevelInfo={{
          name: 'Grace Hopper',
        }}
      />
    );
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('opens RubricContainer when clicked', () => {
    const wrapper = shallow(<RubricFloatingActionButton />);
    expect(wrapper.find('button').length).to.equal(1);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('sends events when opened and closed', () => {
    const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
    const reportingData = {unitName: 'test-2023', levelName: 'test-level'};
    const wrapper = shallow(
      <RubricFloatingActionButton reportingData={reportingData} />
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.RUBRIC_OPENED_FROM_FAB,
      reportingData
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.RUBRIC_CLOSED_FROM_FAB,
      reportingData
    );
    sendEventSpy.restore();
  });
});
