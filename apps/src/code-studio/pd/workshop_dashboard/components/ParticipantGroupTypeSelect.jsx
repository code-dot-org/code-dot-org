import PropTypes from 'prop-types';
import React, {useState} from 'react';
// eslint-disable-next-line no-restricted-imports
import {
  FormGroup,
  ControlLabel,
  FormControl,
  Select,
  HelpBlock,
} from 'react-bootstrap';

import {ParticipantGroupTypes} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * A dropdown used on the Workshop form for selecting a participant group type
 * for Build Your Own workshops.
 */
const ParticipantGroupTypeSelect = ({
  participantGroupType,
  validation,
  readOnly,
  inputStyle,
  onChange,
}) => {
  const [otherOptionSelected, setOtherOptionSelected] = useState(
    !ParticipantGroupTypes.includes(participantGroupType)
  );

  const onParticipantGroupTypeChange = e => {
    setOtherOptionSelected(!ParticipantGroupTypes.includes(e.target.value));
    onChange(e);
  };

  return (
    <FormGroup validationState={validation.style.participant_group_type}>
      <ControlLabel>Participant Group Type</ControlLabel>
      {otherOptionSelected && (
        <FormControl
          id="participant-group-type-other-text"
          name="participant_group_type"
          type="text"
          value={participantGroupType || ''}
          onChange={onParticipantGroupTypeChange}
          maxLength={255}
          style={inputStyle}
          disabled={readOnly}
        />
      )}
      {!otherOptionSelected && (
        <Select
          id="participant-group-type-select"
          name="participant_group_type"
          onChange={onParticipantGroupTypeChange}
          style={inputStyle}
          value={participantGroupType || ''}
          options={ParticipantGroupTypes}
          disabled={readOnly}
        />
      )}
      <HelpBlock>{validation.help.participant_group_type}</HelpBlock>
    </FormGroup>
  );
};

ParticipantGroupTypeSelect.propTypes = {
  participantGroupType: PropTypes.string,
  validation: PropTypes.object,
  readOnly: PropTypes.bool,
  inputStyle: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};

export default ParticipantGroupTypeSelect;
