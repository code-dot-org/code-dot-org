/**
 * Application Dashboard summary view.
 * Route: /summary
 */
import React, {PropTypes} from 'react';
import SummaryTable from './summary_table';
import RegionalPartnerDropdown from './regional_partner_dropdown';
import getScriptData from '@cdo/apps/util/getScriptData';
import Spinner from '../components/spinner';
import $ from 'jquery';

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
    regionalPartnerValue: null
  };

  constructor(props) {
    super(props);
    this.handleRegionalPartnerChange = this.handleRegionalPartnerChange.bind(this);
  }

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
    this.setState({isWorkshopAdmin: getScriptData("props")["isWorkshopAdmin"]});
  }

  handleRegionalPartnerChange = (selected) => {
    const regionalPartnerValue = selected ? selected.value : null;
    const regionalPartnerName = regionalPartnerValue ? selected.label : this.props.route.regionalPartnerName;
    this.setState({regionalPartnerName: regionalPartnerName, regionalPartnerValue: regionalPartnerValue});
    $.ajax({
      method: 'GET',
      url: `/api/v1/pd/applications?regional_partner=${regionalPartnerValue}`,
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
        {this.state.isWorkshopAdmin &&
          <RegionalPartnerDropdown
            onChange={this.handleRegionalPartnerChange}
            regionalPartnerValue={this.state.regionalPartnerValue}
          />
        }
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
