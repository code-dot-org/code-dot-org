import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';

const styles = {
  tableWrapper: {
    float: 'right'
  }
};

export default class CohortViewCalculator extends React.Component {
  static propTypes = {
    accepted: PropTypes.number.isRequired,
    registered: PropTypes.number.isRequired,
    totalCapacity: PropTypes.number.isRequired
  };

  render() {
    return (
      <div style={styles.tableWrapper}>
        <Table striped condensed>
          <caption>Cohort Calulator</caption>
          <thead>
              <tr>
                <th></th>
                <th>Total</th>
              </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                Total Capacity
              </td>
              <td>
                {this.props.totalCapacity}
              </td>
            </tr>
            <tr>
              <td>
                Remaining Capacity
              </td>
              <td>
                {this.props.totalCapacity - this.props.accepted}
              </td>
            </tr>
            <tr>
              <td>
                Accepted
              </td>
              <td>
                {this.props.accepted}
              </td>
            </tr>
            <tr>
              <td>
                Registered
              </td>
              <td>
                {this.props.registered}
              </td>
            </tr>
          </tbody>
        </Table>
      </div>
    );
  }
}
