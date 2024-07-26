import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ParticipantTypePicker from '@cdo/apps/templates/teacherDashboard/ParticipantTypePicker';

describe('ParticipantTypePicker', () => {
  let defaultProps, setParticipantType, handleCancel;

  beforeEach(() => {
    setParticipantType = jest.fn();
    handleCancel = jest.fn();
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
    expect(wrapper.find('ParticipantTypeCard').length).toEqual(3);
  });

  it('clicking on a card calls setParticipantType', () => {
    const wrapper = shallow(
      <ParticipantTypePicker
        {...defaultProps}
        availableParticipantTypes={['student', 'teacher', 'facilitator']}
      />
    );

    wrapper.find('ParticipantTypeCard').at(0).simulate('click');
    expect(setParticipantType).toHaveBeenCalledTimes(1);
  });
});
