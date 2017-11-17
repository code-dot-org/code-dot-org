/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, {PropTypes} from 'react';
import {FormGroup, ControlLabel} from 'react-bootstrap';
import Select from "react-select";
import getScriptData from '@cdo/apps/util/getScriptData';

// Default max height for the React-Select menu popup, as defined in the imported react-select.css,
// is 200px for the container, and 198 for the actual menu (to accommodate 2px for the border).
// React-Select has props for overriding these default css styles. Increase the max height here:
const selectMenuMaxHeight = 400;
const selectStyleProps = {
  menuContainerStyle: {
    maxHeight: selectMenuMaxHeight
  },
  menuStyle: {
    maxHeight: selectMenuMaxHeight - 2
  }
};

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
          {...selectStyleProps}
        />
      </FormGroup>
    );
  }
}
