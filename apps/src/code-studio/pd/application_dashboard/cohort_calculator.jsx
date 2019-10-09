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
  (applications || []).filter(app =>
    CohortCalculatorStatuses.includes(app.status)
  ).length;
}

export function countRegisteredApplicants(applications) {
  // Registered applicants are people with accepted applications and have
  // enrolled in their assigned workshops.
  (applications || []).filter(app => app.registered_workshop === 'Yes').length;
}

export default class CohortCalculator extends React.Component {
  static propTypes = {
    role: PropTypes.string.isRequired,
    regionalPartnerFilterValue: RegionalPartnerValuePropType,
    accepted: PropTypes.number.isRequired,
    registered: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      capacity: null
    };
    this.loadRequest = null;
  }

  componentWillMount() {
    // TODO: load enrollment count
    this.load(this.props.regionalPartnerFilterValue);
  }

  componentWillReceiveProps(nextProps) {
    // TODO: load enrollment count if regionalPartnerFilterValue changes
    this.load(nextProps.regionalPartnerFilterValue);
  }

  componentWillUnmount() {
    this.abortLoad();
  }

  abortLoad() {
    if (this.loadRequest) {
      this.loadRequest.abort();
    }
  }

  load(regionalPartnerFilterValue) {
    this.abortLoad();
    this.setState({loading: true});

    this.loadRequest = $.ajax({
      method: 'GET',
      url: `/api/v1/regional_partners/capacity?role=${
        this.props.role
      }&regional_partner_value=${regionalPartnerFilterValue}`,
      dataType: 'json'
    }).done(data => {
      this.setState({
        loading: false,
        capacity: data.capacity
      });
      this.loadRequest = null;
    });
  }

  render() {
    if (this.state.capacity === null) {
      return null;
    }
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
              <td>Available Seats</td>
              <td>{this.state.capacity}</td>
            </tr>
            <tr>
              {/*TODO: add hover text explaining what these fields represent*/}
              <td>Accepted</td>
              <td>{this.props.accepted}</td>
            </tr>
            <tr>
              <td>Remaining Capacity</td>
              <td>
                {this.state.capacity -
                  Math.max(this.props.accepted, this.props.registered)}
              </td>
            </tr>
            <tr>
              {/*TODO: show total enrollments including non-application enrollment*/}
              <td>Registered</td>
              <td>{this.state.registered}</td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
