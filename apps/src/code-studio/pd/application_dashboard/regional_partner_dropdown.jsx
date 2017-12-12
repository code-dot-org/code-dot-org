/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import Select from "react-select";
import { SelectStyleProps } from '../constants';
import { RegionalPartnerDropdownOptions as dropdownOptions } from './constants';

const styles = {
  select: {
    maxWidth: 500
  }
};

export class RegionalPartnerDropdown extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    regionalPartnerFilter: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    regionalPartners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    }))
  }

  componentWillMount() {
    this.regionalPartners = this.props.regionalPartners.map(v => ({value: v.id, label: v.name}));
    this.regionalPartners.unshift(dropdownOptions.unmatched);
    this.regionalPartners.unshift(dropdownOptions.all);
  }

  render() {
    return (
      <FormGroup>
        <ControlLabel>Select a regional partner</ControlLabel>
        <Select
          value={this.props.regionalPartnerFilter}
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

export default connect(state => ({
  regionalPartners: state.regionalPartners,
}))(RegionalPartnerDropdown);
