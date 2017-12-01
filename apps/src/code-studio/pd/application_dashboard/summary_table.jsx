/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import {Table, Button} from 'react-bootstrap';
import {StatusColors} from './constants';
import _ from 'lodash';

const styles = {
  table: {
    paddingLeft: '15px',
    paddingRight: '15px'
  },
  tableWrapper: {
    width: '33.3%',
    paddingBottom: '30px'
  },
  statusCell: StatusColors
};

const ApplicationDataPropType = PropTypes.shape({
  locked: PropTypes.number.isRequired,
  unlocked: PropTypes.number.isRequired,
});

export default class SummaryTable extends React.Component {
  static propTypes = {
    caption: PropTypes.string.isRequired,
    data: PropTypes.shape({
      accepted: ApplicationDataPropType,
      declined: ApplicationDataPropType,
      interview: ApplicationDataPropType,
      pending: ApplicationDataPropType,
      unreviewed: ApplicationDataPropType,
      waitlisted: ApplicationDataPropType,
    }),
    path: PropTypes.string.isRequired
  }

  static contextTypes = {
    router: PropTypes.object.isRequired
  }

  tableBody() {
    return Object.keys(StatusColors).map((status, i) => {
      if (this.props.data.hasOwnProperty(status)) {
        const data = this.props.data[status];
        const total = data.locked + data.unlocked;
        return (
          <tr key={i}>
            <td style={{...styles.statusCell[status]}}>
              {_.upperFirst(status)}
            </td>
            <td>{data.locked}</td>
            <td>{data.unlocked}</td>
            <td>{total}</td>
          </tr>
        );
      }
    });
  }

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
              <th>Locked</th>
              <th>Unlocked</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {this.tableBody()}
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
