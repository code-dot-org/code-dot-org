/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, {PropTypes} from 'react';
import {FormGroup, ControlLabel} from 'react-bootstrap';
import Select from "react-select";
import {SelectStyleProps} from '../constants';
import getScriptData from '@cdo/apps/util/getScriptData';

export default class RegionalPartnerDropdown extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    regionalPartnerId: PropTypes.number
  }

  componentWillMount() {
    const regionalPartnersList = getScriptData("props")["regionalPartners"];
    this.regionalPartners = regionalPartnersList.map(v => ({value: v.id, label: v.name}));
    this.regionalPartners.unshift({value: null, label: "\u00A0"});
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>Select a regional partner</ControlLabel>
        <Select
          value={this.props.regionalPartnerId}
          onChange={this.props.onChange}
          placeholder={null}
          options={this.regionalPartners}
          {...SelectStyleProps}
        />
      </FormGroup>
    );
  }
}
