import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import analyticsReporter from '@cdo/apps/lib/util/AnalyticsReporter';
import {EVENTS} from '@cdo/apps/lib/util/AnalyticsConstants';
import RubricFloatingActionButton from '@cdo/apps/templates/rubrics/RubricFloatingActionButton';

describe('RubricFloatingActionButton', () => {
  const defaultProps = {
    rubric: {
      level: {
        name: 'test-level',
      },
    },
    currentLevelName: 'test-level',
    studentLevelInfo: null,
  };

  it('begins closed when student level info is null', () => {
    const wrapper = shallow(<RubricFloatingActionButton {...defaultProps} />);
    expect(wrapper.find('RubricContainer').length).to.equal(1);
    expect(wrapper.find('RubricContainer').props().open).to.equal(false);
  });

  it('begins open when student level info is provided', () => {
    const wrapper = shallow(
      <RubricFloatingActionButton
        {...defaultProps}
        studentLevelInfo={{
          name: 'Grace Hopper',
        }}
      />
    );
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('opens RubricContainer when clicked', () => {
    const wrapper = shallow(<RubricFloatingActionButton {...defaultProps} />);
    expect(wrapper.find('button').length).to.equal(1);
    wrapper.find('button').simulate('click');
    expect(wrapper.find('RubricContainer').length).to.equal(1);
  });

  it('sends events when opened and closed', () => {
    const sendEventSpy = sinon.stub(analyticsReporter, 'sendEvent');
    const reportingData = {unitName: 'test-2023', levelName: 'test-level'};
    const wrapper = shallow(
      <RubricFloatingActionButton
        {...defaultProps}
        reportingData={reportingData}
      />
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_OPENED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    wrapper.find('button').simulate('click');
    expect(sendEventSpy).to.have.been.calledWith(
      EVENTS.TA_RUBRIC_CLOSED_FROM_FAB_EVENT,
      {
        ...reportingData,
        viewingStudentWork: false,
        viewingEvaluationLevel: true,
      }
    );
    sendEventSpy.restore();
  });
});
