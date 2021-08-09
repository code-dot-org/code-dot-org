import PropTypes from 'prop-types';
import React from 'react';
import {Table} from 'react-bootstrap';
import {RegionalPartnerValuePropType} from '../components/regional_partner_dropdown';
import {CohortCalculatorStatuses} from '@cdo/apps/generated/pd/sharedApplicationConstants';
import $ from 'jquery';

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
      loadingEnrollmentCount: null,
      enrolled: null
    };
  }

  componentDidMount() {
    this.loadData();
  }

  getPartnerRegistrationCount(role, regional_partner_value) {
    return $.get({
      url: `/api/v1/regional_partners/enrolled?role=${role}&regional_partner_value=${regional_partner_value}`,
      dataType: 'json'
    });
  }

  loadData(regionalPartnerFilterValue) {
    this.setState({loadingEnrollmentCount: true});

    this.getPartnerRegistrationCount(
      this.props.role,
      this.props.regionalPartnerFilterValue
    )
      .done(data => {
        this.setState({
          loadingEnrollmentCount: false,
          enrolled: data.enrolled
        });
      })
      .fail(() => {
        this.setState({loadingEnrollmentCount: false});
      });
  }

  render() {
    return (
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
              <td>Accepted</td>
              <td>{this.props.accepted}</td>
            </tr>
            <tr>
              <td>Registered</td>
              <td>
                {this.state.loadingEnrollmentCount
                  ? 'Loading...'
                  : this.state.enrolled || '-'}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}

const styles = {
  tableWrapper: {
    float: 'right'
  }
};
