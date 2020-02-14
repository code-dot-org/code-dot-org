/**
 * Table displaying a summary of application statuses
 */
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {Table, Button} from 'react-bootstrap';
import {StatusColors, getApplicationStatuses} from './constants';
import _ from 'lodash';
import color from '@cdo/apps/util/color';

const styles = {
  table: {
    paddingLeft: '15px',
    paddingRight: '15px'
  },
  tableWrapper: {
    paddingBottom: '30px'
  },
  totalsRow: {
    fontWeight: 'bold',
    borderTopStyle: 'solid',
    borderTopWidth: 2,
    borderTopColor: color.charcoal
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

  showLocked =
    this.props.canSeeLocked && this.props.applicationType === 'facilitator';

  tableBody() {
    const totals = {
      locked: 0,
      all: 0
    };
    const categoryRows = Object.keys(this.props.data).map((status, i) => {
      const statusData = this.props.data[status];
      totals.locked += statusData.locked;
      totals.all += statusData.total;
      return (
        <tr key={i}>
          <td style={{...styles.statusCell[status]}}>
            {getApplicationStatuses(this.props.applicationType)[status] ||
              _.upperFirst(status)}
          </td>
          {this.showLocked && <td>{statusData.locked}</td>}
          {this.showLocked && <td>{statusData.total - statusData.locked}</td>}
          <td>{statusData.total}</td>
        </tr>
      );
    });

    return [
      ...categoryRows,
      <tr key="totals-row" style={styles.totalsRow}>
        <td style={{textAlign: 'right'}}>Total</td>
        {this.showLocked && <td>{totals.locked}</td>}
        {this.showLocked && <td>{totals.all - totals.locked}</td>}
        <td>{totals.all}</td>
      </tr>
    ];
  }

  handleViewClick = event => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path}`);
  };

  handleViewCohortClick = event => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path}_cohort`);
  };

  render() {
    return (
      <div style={styles.tableWrapper}>
        <Table id={this.props.id} striped condensed style={styles.table}>
          <caption>{this.props.caption}</caption>
          <thead>
            <tr>
              <th>Status</th>
              {this.showLocked && <th>Locked</th>}
              {this.showLocked && <th>Unlocked</th>}
              <th>Count</th>
            </tr>
          </thead>
          <tbody>{this.tableBody()}</tbody>
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
  canSeeLocked: state.applicationDashboard.permissions.lockApplication
}))(SummaryTable);
