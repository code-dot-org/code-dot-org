import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';

const styles = {
  tableWrapper: {
    float: 'right'
  }
};

export default class CohortCalculator extends React.Component {
  static propTypes = {
    role: PropTypes.string.isRequired,
    regionalPartnerFilter: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    accepted: PropTypes.number.isRequired,
    registered: PropTypes.number.isRequired
  };

  constructor(props) {
    super(props);

    this.state = {
      capacity: null,
      accepted: null,
      registered: null,
    };
  }

  componentWillMount() {
    this.setState({
      accepted: this.props.accepted,
      registered: this.props.registered
    });
    this.load(this.props.regionalPartnerFilter);
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.regionalPartnerFilter !== this.props.regionalPartnerFilter) {
      this.load(nextProps.regionalPartnerFilter);
    }
  }

  load(regionalPartnerFilter) {
    $.ajax({
      method: 'GET',
      url: `/api/v1/regional_partners/capacity?role=${this.props.role}&regional_partner_filter=${regionalPartnerFilter}`,
      dataType: 'json'
    })
      .done(data => {
        this.setState({
          capacity: data.capacity,
          accepted: this.props.accepted,
          registered: this.props.registered
        });
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
