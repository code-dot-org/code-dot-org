/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
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
  statusCell: StatusColors,
  viewApplicationsButton: {
    marginRight: '10px'
  }
};

const ApplicationDataPropType = PropTypes.shape({
  locked: PropTypes.number.isRequired,
  unlocked: PropTypes.number.isRequired,
});

export class SummaryTable extends React.Component {
  static propTypes = {
    showLocked: PropTypes.bool,
    caption: PropTypes.string.isRequired,
    data: PropTypes.shape({
      accepted: ApplicationDataPropType,
      declined: ApplicationDataPropType,
      interview: ApplicationDataPropType,
      pending: ApplicationDataPropType,
      unreviewed: ApplicationDataPropType,
      waitlisted: ApplicationDataPropType,
    }),
    path: PropTypes.string.isRequired,
    id: PropTypes.string
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

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
            {this.props.showLocked && <td>{data.locked}</td>}
            {this.props.showLocked && <td>{data.unlocked}</td>}
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

  handleViewCohortClick = (event) => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path}_cohort`);
  };

  render() {
    return (
      <div className="col-xs-4" style={styles.tableWrapper}>
        <Table
          id={this.props.id}
          striped
          condensed
          style={styles.table}
        >
          <caption>{this.props.caption}</caption>
          <thead>
            <tr>
              <th>Status</th>
              {this.props.showLocked && <th>Locked</th>}
              {this.props.showLocked && <th>Unlocked</th>}
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
          style={styles.viewApplicationsButton}
        >
          View all applications
        </Button>
        {
          this.props.data.accepted.locked + this.props.data.accepted.unlocked > 0 && (
            <Button
              href={this.context.router.createHref(`/${this.props.path}_cohort`)}
              onClick={this.handleViewCohortClick}
            >
              View accepted cohort
            </Button>
          )
        }
      </div>
    );
  }
}

export default connect(state => ({
  showLocked: state.applicationDashboard.permissions.lockApplication,
}))(SummaryTable);
