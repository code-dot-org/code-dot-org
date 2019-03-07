import PropTypes from 'prop-types';
import React from 'react';
import {FormGroup} from 'react-bootstrap';
import Select from 'react-select';
import {ScholarshipDropdownOptions} from '@cdo/apps/generated/pd/scholarshipInfoConstants';

export class ScholarshipDropdown extends React.Component {
  static propTypes = {
    scholarshipStatus: PropTypes.string,
    onChange: PropTypes.func
  };

  render() {
    return (
      <FormGroup>
        <Select
          clearable={false}
          value={this.props.scholarshipStatus}
          onChange={this.props.onChange}
          options={ScholarshipDropdownOptions}
        />
      </FormGroup>
    );
  }
}
