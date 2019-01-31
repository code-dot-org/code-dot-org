/**
 * Table displaying a summary of application statuses
 */
import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {Table, Button} from 'react-bootstrap';
import {StatusColors, ApplicationStatuses} from './constants';
import _ from 'lodash';

const styles = {
  table: {
    paddingLeft: '15px',
    paddingRight: '15px'
  },
  tableWrapper: {
    paddingBottom: '30px'
  },
  statusCell: StatusColors,
  viewApplicationsButton: {
    marginRight: '10px'
  }
};

const ApplicationDataPropType = PropTypes.shape({
  total: PropTypes.number.isRequired,
  locked: PropTypes.number
});

export class SummaryTable extends React.Component {
  static propTypes = {
    canSeeLocked: PropTypes.bool,
    caption: PropTypes.string.isRequired,

    // keys are available statuses: {status: ApplicationDataPropType}
    data: PropTypes.objectOf(ApplicationDataPropType),
    path: PropTypes.string.isRequired,
    id: PropTypes.string,
    applicationType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  showLocked = this.props.canSeeLocked && this.props.applicationType === 'facilitator';

  tableBody() {
    return Object.keys(this.props.data).map((status, i) => {
      const statusData = this.props.data[status];
      return (
        <tr key={i}>
          <td style={{...styles.statusCell[status]}}>
            {ApplicationStatuses[this.props.applicationType][status] || _.upperFirst(status)}
          </td>
          {this.showLocked && <td>{statusData.locked}</td>}
          {this.showLocked && <td>{statusData.total - statusData.locked}</td>}
          <td>{statusData.total}</td>
        </tr>
      );
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
      <div style={styles.tableWrapper}>
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
              {this.showLocked && <th>Locked</th>}
              {this.showLocked && <th>Unlocked</th>}
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
        <Button
          href={this.context.router.createHref(`/${this.props.path}_cohort`)}
          onClick={this.handleViewCohortClick}
        >
          View accepted cohort
        </Button>
      </div>
    );
  }
}

export default connect(state => ({
  canSeeLocked: state.applicationDashboard.permissions.lockApplication,
}))(SummaryTable);
