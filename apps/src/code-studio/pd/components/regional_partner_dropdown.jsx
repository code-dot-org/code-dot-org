/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {FormGroup, ControlLabel} from 'react-bootstrap';
import Select from 'react-select';
import {SelectStyleProps} from '../constants';
import {setRegionalPartnerFilter} from './regional_partners_reducers';
import {WorkshopAdmin} from '../workshop_dashboard/permission';

const styles = {
  select: {
    maxWidth: '500px'
  }
};

export const ALL_PARTNERS_LABEL = 'All Regional Partners';
export const ALL_PARTNERS_VALUE = 'all';
export const UNMATCHED_PARTNER_LABEL = 'No Partner/Unmatched';
export const UNMATCHED_PARTNER_VALUE = 'none';

export const ALL_PARTNERS_OPTION = {
  label: ALL_PARTNERS_LABEL,
  value: ALL_PARTNERS_VALUE
};
export const UNMATCHED_PARTNER_OPTION = {
  label: UNMATCHED_PARTNER_LABEL,
  value: UNMATCHED_PARTNER_VALUE
};

export const RegionalPartnerValuePropType = PropTypes.oneOfType([
  PropTypes.number, // regional partner id
  PropTypes.oneOf([ALL_PARTNERS_VALUE, UNMATCHED_PARTNER_VALUE])
]);

export const RegionalPartnerPropType = PropTypes.shape({
  value: RegionalPartnerValuePropType.isRequired,
  label: PropTypes.string.isRequired
});

export const RegionalPartnerShape = PropTypes.shape({
  id: PropTypes.number,
  name: PropTypes.string
});

export class RegionalPartnerDropdown extends React.Component {
  static propTypes = {
    onChange: PropTypes.func,
    regionalPartnerFilter: RegionalPartnerPropType.isRequired,
    regionalPartners: PropTypes.arrayOf(RegionalPartnerShape),
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

  UNSAFE_componentWillMount() {
    this.regionalPartners = this.props.regionalPartners.map(v => ({
      value: v.id,
      label: v.name
    }));

    let additionalOptions =
      this.props.additionalOptions || this.getDefaultAdditionalOptions();
    if (additionalOptions) {
      additionalOptions.forEach(option =>
        this.regionalPartners.unshift({
          value: option.value,
          label: option.label
        })
      );
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
    regionalPartners: state.regionalPartners.regionalPartners,
    regionalPartnerFilter: state.regionalPartners.regionalPartnerFilter,
    isWorkshopAdmin: state.applicationDashboard
      ? state.applicationDashboard.permissions.workshopAdmin
      : state.workshopDashboard.permission.has(WorkshopAdmin)
  }),
  dispatch => ({
    onChange(selected) {
      dispatch(setRegionalPartnerFilter(selected));
    }
  })
)(RegionalPartnerDropdown);
