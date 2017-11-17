/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React, {PropTypes} from 'react';
import SummaryTable from './summary_table';
import Spinner from '../components/spinner';
import $ from 'jquery';
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

export default class Summary extends React.Component {
  static propTypes = {
    route: PropTypes.shape({
      regionalPartnerName: PropTypes.string.isRequired
    })
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  state = {
    loading: true,
    applications: null,
    regionalPartnerName: this.props.route.regionalPartnerName,
    regionalPartnerId: null
  };

  componentWillMount() {
    $.ajax({
      method: 'GET',
      url: '/api/v1/pd/applications',
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });

    const regionalPartnersList = getScriptData("props")["regionalPartners"];
    this.regionalPartners = regionalPartnersList.map(v => ({value: v.id, label: v.name}));
    this.regionalPartners.unshift({value: null, label: "\u00A0"});
  }

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerId = selected ? selected.value : null;
    const regionalPartnerName = regionalPartnerId ? selected.label : this.props.route.regionalPartnerName;
    this.setState({regionalPartnerName: regionalPartnerName, regionalPartnerId: regionalPartnerId});
    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications?regional_partner=${regionalPartnerId}`,
      dataType: 'json'
    })
    .done(data => {
      this.setState({
        loading: false,
        applications: data
      });
    });
  };

  render() {
    if (this.state.loading) {
      return <Spinner/>;
    }
    return (
      <div>
        <div>
          <FormGroup>
            <ControlLabel>Select a regional partner</ControlLabel>
            <Select
              value={this.state.regionalPartnerId}
              onChange={this.handleRegionalPartnerChange}
              placeholder={null}
              options={this.regionalPartners}
              {...selectStyleProps}
            />
          </FormGroup>
        </div>
        <h1>{this.state.regionalPartnerName}</h1>
        <div className="row">
          <SummaryTable
            caption="CS Fundamentals Facilitators"
            data={this.state.applications["csf_facilitators"]}
            path="csf_facilitators"
          />
          <SummaryTable
            caption="CS Discoveries Facilitators"
            data={this.state.applications["csd_facilitators"]}
            path="csd_facilitators"
          />
          <SummaryTable
            caption="CS Principles Facilitators"
            data={this.state.applications["csp_facilitators"]}
            path="csp_facilitators"
          />
        </div>
      </div>
    );
  }
}
