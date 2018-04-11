import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import {RegionalPartnerFilterValuePropType} from './constants';
import $ from 'jquery';

const styles = {
  tableWrapper: {
    float: 'right'
  }
};

export default class CohortCalculator extends React.Component {
  static propTypes = {
    role: PropTypes.string.isRequired,
    regionalPartnerFilterValue: RegionalPartnerFilterValuePropType,
    accepted: PropTypes.number.isRequired,
    registered: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      capacity: null,
      accepted: null,
      registered: null,
    };
    this.loadRequest = null;
  }

  componentWillMount() {
    this.load(this.props.regionalPartnerFilterValue);
  }

  componentWillReceiveProps(nextProps) {
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
      url: `/api/v1/regional_partners/capacity?role=${this.props.role}&regional_partner_value=${regionalPartnerFilterValue}`,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          loading: false,
          capacity: data.capacity,
          accepted: this.props.accepted,
          registered: this.props.registered
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
              <td>
                Available Seats
              </td>
              <td>
                {this.state.capacity}
              </td>
            </tr>
            <tr>
              <td>
                Accepted
              </td>
              <td>
                {this.state.accepted}
              </td>
            </tr>
            <tr>
              <td>
                Remaining Capacity
              </td>
              <td>
                {this.state.capacity - this.state.accepted}
              </td>
            </tr>
            <tr>
              <td>
                Registered
              </td>
              <td>
                {this.state.registered}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
