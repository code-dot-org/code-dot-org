/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import {Table, Button} from 'react-bootstrap';
import color from '@cdo/apps/util/color';

const styles = {
  table: {
    paddingLeft: '15px',
    paddingRight: '15px'
  },
  tableWrapper: {
    width: '33.3%',
    paddingBottom: '30px'
  }
};

export default class SummaryTable extends React.Component {
  static propTypes = {
    caption: PropTypes.string.isRequired,
    data: PropTypes.object,
    path: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  tableRow = (label, bgColor, textColor, data) =>  {
    const status = label.toLowerCase();
    const total = data[status];

    return (
      <tr>
        <td style={{backgroundColor: bgColor, color: textColor}}>{label}</td>
        <td>{total}</td>
      </tr>
    );
  };

  handleViewClick = (event) => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path}`);
  };

  render() {
    return (
      <div className="col-xs-4" style={styles.tableWrapper}>
        <Table striped condensed style={styles.table}>
          <caption>{this.props.caption}</caption>
          <thead>
            <tr>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {this.tableRow('Accepted', color.level_perfect, color.black, this.props.data)}
            {this.tableRow('Waitlisted', color.level_passed, color.black, this.props.data)}
            {this.tableRow('Pending', color.orange, color.black, this.props.data)}
            {this.tableRow('Declined', color.red, color.white, this.props.data)}
            {this.tableRow('Unreviewed', color.charcoal, color.white, this.props.data)}
          </tbody>
        </Table>
        <Button
          href={this.context.router.createHref(`/${this.props.path}`)}
          onClick={this.handleViewClick}
        >
          View all applications
        </Button>
      </div>
    );
  }
}
