import React from 'react';
import PropTypes from 'prop-types';
import {FormGroup, ControlLabel, FormControl, HelpBlock} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {CsdCustomWorkshopModules} from '@cdo/apps/generated/pd/sharedWorkshopConstants';

/**
 * A dropdown used on the Workshop form for selecting a subject.
 * For professional learning purposes, a subject usually indicates which
 * part of a multi-step PL course this workshop represents.
 * For example: 5-day summer workshop, academic workshop 3, etc.
 */
export default function ModuleSelect({
  course,
  module,
  readOnly,
  inputStyle,
  validation,
  onChange,
}) {
  return (
    <FormGroup validationState={validation.style.module}>
      <ControlLabel>Module</ControlLabel>
      <FormControl
        componentClass="select"
        value={module || ''}
        id="module"
        name="module"
        onChange={onChange}
        style={inputStyle}
        disabled={readOnly}
      >
        {module ? null : <option />}
        {CsdCustomWorkshopModules.map((module, i) => (
          <option key={i} value={module}>
            {module}
          </option>
        ))}
      </FormControl>
      <HelpBlock>{validation.help.module}</HelpBlock>
    </FormGroup>
  );
}

ModuleSelect.propTypes = {
  course: PropTypes.string.isRequired,
  module: PropTypes.string,
  readOnly: PropTypes.bool,
  inputStyle: PropTypes.object,
  validation: PropTypes.object,
  onChange: PropTypes.func.isRequired,
};
