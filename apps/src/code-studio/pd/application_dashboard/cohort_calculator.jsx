import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap';
import {RegionalPartnerValuePropType} from '../components/regional_partner_dropdown';
import {CohortCalculatorStatuses} from '@cdo/apps/generated/pd/sharedApplicationConstants';
import $ from 'jquery';

const styles = {
  tableWrapper: {
    float: 'right'
  }
};

export function countAcceptedApplications(applications) {
  return (applications || []).filter(app =>
    CohortCalculatorStatuses.includes(app.status)
  ).length;
}

export default class CohortCalculator extends React.Component {
  static propTypes = {
    role: PropTypes.string.isRequired,
    regionalPartnerFilterValue: RegionalPartnerValuePropType,
    accepted: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loadingCapacity: null,
      capacity: null,
      loadingRegistrationCount: null,
      registered: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getPartnerCapacity(role, regional_partner_value) {
    return $.get({
      url: `/api/v1/regional_partners/capacity?role=${role}&regional_partner_value=${regional_partner_value}`,
      dataType: 'json'
    });
  }

  getPartnerRegistrationCount(role, regional_partner_value) {
    return $.get({
      url: `/api/v1/regional_partners/enrolled?role=${role}&regional_partner_value=${regional_partner_value}`,
      dataType: 'json'
    });
  }

  loadData(regionalPartnerFilterValue) {
    this.setState({loadingCapacity: true, loadingRegistrationCount: true});

    this.getPartnerCapacity(
      this.props.role,
      this.props.regionalPartnerFilterValue
    )
      .done(data => {
        this.setState({
          loadingCapacity: false,
          capacity: data.capacity
        });
      })
      .fail(() => {
        this.setState({loadingCapacity: false});
      });

    this.getPartnerRegistrationCount(
      this.props.role,
      this.props.regionalPartnerFilterValue
    )
      .done(data => {
        this.setState({
          loadingRegistrationCount: false,
          registered: data.enrolled
        });
      })
      .fail(() => {
        this.setState({loadingRegistrationCount: false});
      });
  }

  render() {
    return (
      this.state.capacity && (
        <div style={styles.tableWrapper}>
          <Table striped condensed>
            <caption>Cohort Calculator</caption>
            <thead>
              <tr>
                <th />
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Available Seats</td>
                <td>
                  {this.state.loadingCapacity
                    ? 'Loading...'
                    : this.state.capacity}
                </td>
              </tr>
              <tr>
                {/*TODO: add hover text explaining what these fields represent*/}
                <td>Accepted</td>
                <td>{this.props.accepted}</td>
              </tr>
              <tr>
                <td>Remaining Capacity</td>
                <td>
                  {this.state.capacity &&
                    this.state.capacity -
                      Math.max(this.props.accepted, this.state.registered)}
                </td>
              </tr>
              <tr>
                <td>Registered</td>
                <td>
                  {this.state.loadingRegistrationCount
                    ? 'Loading...'
                    : this.state.registered}
                </td>
              </tr>
            </tbody>
          </Table>
        </div>
      )
    );
  }
}
