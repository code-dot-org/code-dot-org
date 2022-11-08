import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap';
import Select from 'react-select';

// update this to lock scholarships so that scholarship status can't be updated via the UI.
const locked = false;

export class ScholarshipDropdown extends React.Component {
  static propTypes = {
    scholarshipStatus: PropTypes.string,
    dropdownOptions: PropTypes.array,
    onChange: PropTypes.func,
    disabled: PropTypes.bool,
    isWorkshopAdmin: PropTypes.bool.isRequired
  };

  render() {
    return (
      <FormGroup>
        <Select
          clearable={false}
          value={this.props.scholarshipStatus}
          onChange={this.props.onChange}
          options={this.props.dropdownOptions}
          disabled={locked || this.props.disabled}
        />
      </FormGroup>
    );
  }
}
