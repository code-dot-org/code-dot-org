/**
 * Form for creating / editing workshop details.
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import Select from 'react-select';
import _ from 'lodash';
import {FormGroup, ControlLabel} from 'react-bootstrap';
import {
  WorkshopAdmin,
  Organizer,
  ProgramManager,
  CsfFacilitator,
  PermissionPropType
} from '../permission';

export class RegionalPartnerSelector extends React.Component {
  static propTypes = {
    permission: PermissionPropType.isRequired,
    workshop: PropTypes.shape({
      id: PropTypes.number.isRequired,
      facilitators: PropTypes.array.isRequired,
      location_name: PropTypes.string.isRequired,
      location_address: PropTypes.string,
      capacity: PropTypes.number.isRequired,
      on_map: PropTypes.bool.isRequired,
      funded: PropTypes.bool.isRequired,
      funding_type: PropTypes.string,
      course: PropTypes.string.isRequired,
      subject: PropTypes.string,
      fee: PropTypes.string,
      notes: PropTypes.string,
      sessions: PropTypes.array.isRequired,
      enrolled_teacher_count: PropTypes.number.isRequired,
      regional_partner_name: PropTypes.string,
      regional_partner_id: PropTypes.number,
      virtual: PropTypes.bool,
      third_party_provider: PropTypes.string,
      suppress_email: PropTypes.bool,
      organizer: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string
      })
    }),
    readOnly: PropTypes.bool,
    inputStyle: PropTypes.object,
    handleRegionalPartnerSelect: PropTypes.func.isRequired,
    regionalPartnerId: PropTypes.string,
    regionalPartners: PropTypes.array
  };

  render() {
    const editDisabled =
      this.props.readOnly ||
      // Enabled for these permissions
      (!this.props.permission.hasAny(
        WorkshopAdmin,
        Organizer,
        ProgramManager
      ) &&
        // Enabled for CSF facilitators when they are creating a new workshop
        !(this.props.permission.has(CsfFacilitator) && !this.props.workshop));

    const options = [];
    if (
      this.props.permission.has(CsfFacilitator) ||
      this.props.permission.has(WorkshopAdmin)
    ) {
      options.push({value: '', label: 'None'});
    }

    if (this.props.regionalPartners) {
      const sortedPartners = _.sortBy(
        this.props.regionalPartners,
        partner => partner.name
      );
      options.push(
        ...sortedPartners.map(partner => ({
          value: partner.id,
          label: partner.name
        }))
      );
    } else if (this.props.workshop) {
      // Display the currently selected partner name, even if the list hasn't yet loaded.
      options.push({
        value: this.props.workshop.regional_partner_id || '',
        label: this.props.workshop.regional_partner_name
      });
    }

    return (
      <FormGroup>
        <ControlLabel>Regional Partner</ControlLabel>
        {options.length > 1 && (
          <Select
            id="regional-partner-select"
            name="regional_partner_id"
            onChange={this.props.handleRegionalPartnerSelect}
            style={this.props.inputStyle}
            value={this.props.regionalPartnerId || ''}
            options={options}
            // Facilitators (who are not organizers, partners, nor admins) cannot edit this field
            disabled={editDisabled}
          />
        )}
        {options.length === 1 && (
          <p id="regional-partner-name">{options[0].label}</p>
        )}
      </FormGroup>
    );
  }
}

export default connect(state => ({
  permission: state.workshopDashboard.permission
}))(RegionalPartnerSelector);
