/**
 * Dropdown for admins to select which
 * RegionalPartner's applications to view
 */

import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FormGroup, ControlLabel } from 'react-bootstrap';
import Select from "react-select";
import { SelectStyleProps } from '../constants';

const styles = {
  select: {
    maxWidth: '500px'
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
    })),
    additionalOptions: PropTypes.array,
  };

  componentWillMount() {
    this.regionalPartners = this.props.regionalPartners.map(v => ({value: v.id, label: v.name}));
    if (this.props.additionalOptions) {
      this.props.additionalOptions.forEach((option) => this.regionalPartners.unshift({value: option.value, label: option.label}));
    }
  }

  componentDidMount() {
    let regionalPartnerFilter;
    if (this.props.regionalPartnerFilter) {
      regionalPartnerFilter = this.props.regionalPartnerFilter;
    } else if (sessionStorage.getItem("regionalPartnerFilter")) {
      regionalPartnerFilter = sessionStorage.getItem("regionalPartnerFilter");
    } else {
      regionalPartnerFilter = 'none';
    }
    const initialOption = this.regionalPartners.find((element) => {
      return element.value === regionalPartnerFilter;
    });
    this.handleChange(initialOption);
  }

  handleChange = (selected) => {
    this.props.onChange(selected);
    sessionStorage.setItem("regionalPartnerFilter", selected.value);
  };

  render() {
    return (
      <FormGroup>
        <ControlLabel>Select a regional partner</ControlLabel>
        <Select
          clearable={false}
          value={this.props.regionalPartnerFilter}
          onChange={this.handleChange}
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
