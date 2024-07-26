import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import Select from 'react-select';

import DCDO from '@cdo/apps/dcdo';

// if locked, the scholarship status can't be updated unless the user is a workshop admin.
const locked = DCDO.get('scholarship-dropdown-locked', true);

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
