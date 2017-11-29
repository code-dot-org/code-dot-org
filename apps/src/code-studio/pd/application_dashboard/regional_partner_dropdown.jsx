/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, {PropTypes} from 'react';
import {FormGroup, ControlLabel} from 'react-bootstrap';
import Select from "react-select";
import {SelectStyleProps} from '../constants';
import {RegionalPartnerDropdownOptions as dropdownOptions} from './constants';
import getScriptData from '@cdo/apps/util/getScriptData';

const styles = {
  select: {
    maxWidth: 500
  }
};

export default class RegionalPartnerDropdown extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    regionalPartnerValue: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  }

  componentWillMount() {
    const regionalPartnersList = getScriptData("props")["regionalPartners"];
    this.regionalPartners = regionalPartnersList.map(v => ({value: v.id, label: v.name}));
    this.regionalPartners.unshift(dropdownOptions.unmatched);
    this.regionalPartners.unshift(dropdownOptions.all);
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>Select a regional partner</ControlLabel>
        <Select
          value={this.props.regionalPartnerValue}
          onChange={this.props.onChange}
          placeholder={null}
          options={this.regionalPartners}
          style={styles.select}
          {...SelectStyleProps}
        />
      </FormGroup>
    );
  }
}
