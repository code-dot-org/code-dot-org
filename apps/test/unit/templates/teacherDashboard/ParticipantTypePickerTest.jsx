import React from 'react';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import {assert, expect} from '../../../util/reconfiguredChai';
import ParticipantTypePicker from '@cdo/apps/templates/teacherDashboard/ParticipantTypePicker';

describe('ParticipantTypePicker', () => {
  let defaultProps, setParticipantType, handleCancel;

  beforeEach(() => {
    setParticipantType = sinon.spy();
    handleCancel = sinon.spy();
    defaultProps = {
      title: 'Create a new section',
      setParticipantType,
      handleCancel,
      availableParticipantTypes: ['student'],
    };
  });

  it('shows 3 cards when 3 participant types available', () => {
    const wrapper = shallow(
      <ParticipantTypePicker
        {...defaultProps}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
      />
    );
    assert.equal(wrapper.find('ParticipantTypeCard').length, 3);
  });

  it('clicking on a card calls setParticipantType', () => {
    const wrapper = shallow(
      <ParticipantTypePicker
        {...defaultProps}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
      />
    );

    wrapper.find('ParticipantTypeCard').at(0).simulate('click');
    expect(setParticipantType).to.have.been.calledOnce;
  });
});
