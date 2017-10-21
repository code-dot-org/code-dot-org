/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import {Table} from 'react-bootstrap';
import color from '@cdo/apps/util/color';

export default class SummaryTable extends React.Component {
  static propTypes = {
    caption: PropTypes.string.isRequired,
    data: PropTypes.object
  }

  tableRow = (label, bgColor, data) =>  {
    return (
      <tr>
        <td style={{backgroundColor: bgColor}}>{label}</td>
        <td>{label}</td>
        <td>{label}</td>
        <td>{label}</td>
      </tr>
    );
  };

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
          {this.tableRow('Accepted', color.level_perfect, this.props.data)}
          {this.tableRow('Waitlisted', color.level_passed, this.props.data)}
          {this.tableRow('Pending', color.orange, this.props.data)}
          {this.tableRow('Declined', color.red, this.props.data)}
          {this.tableRow('Unreviewed', color.charcoal, this.props.data)}
        </tbody>
      </Table>
    );
  }
}
