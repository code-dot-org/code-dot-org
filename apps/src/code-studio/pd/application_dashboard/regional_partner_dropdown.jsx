/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import Select from "react-select";
import { SelectStyleProps } from '../constants';
import { setRegionalPartnerFilter } from './reducers';
import {
  RegionalPartnerPropType,
  ALL_PARTNERS_OPTION,
  UNMATCHED_PARTNER_OPTION
} from './constants';

const styles = {
  select: {
    maxWidth: '500px'
  }
};

export class RegionalPartnerDropdown extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    regionalPartnerFilter: RegionalPartnerPropType.isRequired,
    regionalPartners: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.number,
      name: PropTypes.string
    })),
    additionalOptions: PropTypes.array,
    isWorkshopAdmin: PropTypes.bool
  };

  getDefaultAdditionalOptions() {
    let additionalOptions = [ALL_PARTNERS_OPTION];
    if (this.props.isWorkshopAdmin) {
      additionalOptions.push(UNMATCHED_PARTNER_OPTION);
    }
    return additionalOptions;
  }

  componentWillMount() {
    this.regionalPartners = this.props.regionalPartners.map(v => ({value: v.id, label: v.name}));

    let additionalOptions = this.props.additionalOptions || this.getDefaultAdditionalOptions();
    if (additionalOptions) {
      additionalOptions.forEach((option) => this.regionalPartners.unshift({value: option.value, label: option.label}));
    }
  }

  render() {
    return (
      <FormGroup style={styles.select}>
        <ControlLabel>Select a regional partner</ControlLabel>
        <Select
          clearable={false}
          value={this.props.regionalPartnerFilter.value}
          onChange={this.props.onChange}
          placeholder={null}
          options={this.regionalPartners}
          {...SelectStyleProps}
        />
      </FormGroup>
    );
  }
}

export default connect(
  state => ({
    regionalPartners: state.regionalPartners,
    regionalPartnerFilter: state.regionalPartnerFilter,
    isWorkshopAdmin: state.permissions.workshopAdmin
  }),
  dispatch => ({
    onChange(selected) {
      dispatch(setRegionalPartnerFilter(selected));
    }
  })
)(RegionalPartnerDropdown);
