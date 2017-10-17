/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import color from '@cdo/apps/util/color';

export default class SummaryTable extends React.Component {
  static propTypes = {
    caption: PropTypes.string.isRequired
  }

  render() {
    return (
      <Table striped condensed>
        <caption>{this.props.caption}</caption>
        <thead>
          <tr>
            <th>Status</th>
            <th>Locked</th>
            <th>Unlocked</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={{backgroundColor: color.level_perfect}}>Accepted</td>
            <td>accepted && locked</td>
            <td>accepted && unlocked</td>
            <td>accepted total</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color.level_passed}}>Waitlisted</td>
            <td>waitlisted && locked</td>
            <td>waitlisted && unlocked</td>
            <td>waitlisted total</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color.orange}}>Pending</td>
            <td>pending && locked</td>
            <td>pending && unlocked</td>
            <td>pending total</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color.red}}>Declined</td>
            <td>declined && locked</td>
            <td>declined && unlocked</td>
            <td>declined total</td>
          </tr>
          <tr>
            <td style={{backgroundColor: color.charcoal}}>Unreviewed</td>
            <td>unreviewed && locked</td>
            <td>unreviewed && unlocked</td>
            <td>unreviewed total</td>
          </tr>
        </tbody>
      </Table>
    );
  }
}
