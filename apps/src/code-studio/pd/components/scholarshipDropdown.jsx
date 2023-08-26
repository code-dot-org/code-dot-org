import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import Select from 'react-select';

// update this to lock scholarships so that scholarship status can't be updated via the UI.
const locked = false;

const ScholarshipDropdown = ({
  scholarshipStatus,
  dropdownOptions,
  onChange,
  disabled,
  isWorkshopAdmin,
}) => (
  <FormGroup>
    <Select
      clearable={false}
      value={scholarshipStatus}
      onChange={onChange}
      options={dropdownOptions}
      disabled={disabled || (locked && !isWorkshopAdmin)}
    />
  </FormGroup>
);

ScholarshipDropdown.propTypes = {
  scholarshipStatus: PropTypes.string,
  dropdownOptions: PropTypes.array,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  isWorkshopAdmin: PropTypes.bool.isRequired,
};

export default ScholarshipDropdown;
