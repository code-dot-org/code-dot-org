/**
 * Table displaying a summary of application statuses
 */
import PropTypes from 'prop-types';
import React from 'react';
import {Table, Button} from 'react-bootstrap'; // eslint-disable-line no-restricted-imports
import {StatusColors, getApplicationStatuses} from './constants';
import {difference, upperFirst} from 'lodash';
import color from '@cdo/apps/util/color';

const ApplicationDataPropType = PropTypes.shape({
  total: PropTypes.number.isRequired,
  locked: PropTypes.number,
});

export class SummaryTable extends React.Component {
  static propTypes = {
    caption: PropTypes.string.isRequired,
    data: PropTypes.objectOf(ApplicationDataPropType),
    path: PropTypes.string.isRequired,
    id: PropTypes.string,
    isWorkshopAdmin: PropTypes.bool,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired,
  };

  tableBody() {
    const totals = {
      locked: 0,
      all: 0,
    };

    const statusesInOrder = difference(
      [
        'incomplete',
        'reopened',
        'awaiting_admin_approval',
        'unreviewed',
        'pending',
        'pending_space_availability',
        'accepted',
        'declined',
        'withdrawn',
      ],
      this.props.isWorkshopAdmin ? [] : ['incomplete']
    );

    const categoryRows = statusesInOrder.map((status, i) => {
      const statusData = this.props.data[status];
      const currentLocked = statusData?.locked || 0;
      const currentTotal = statusData?.total || 0;
      totals.locked += currentLocked;
      totals.all += currentTotal;
      return (
        <tr key={i}>
          <td style={{...styles.statusCell[status]}}>
            {getApplicationStatuses()[status] || upperFirst(status)}
          </td>
          <td>{currentTotal}</td>
        </tr>
      );
    });

    return [
      ...categoryRows,
      <tr key="totals-row" style={styles.totalsRow}>
        <td style={{textAlign: 'right'}}>Total</td>
        <td>{totals.all}</td>
      </tr>,
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

const styles = {
  table: {
    paddingLeft: '15px',
    paddingRight: '15px',
  },
  tableWrapper: {
    paddingBottom: '30px',
  },
  totalsRow: {
    fontWeight: 'bold',
    borderTopStyle: 'solid',
    borderTopWidth: 2,
    borderTopColor: color.charcoal,
  },
  statusCell: StatusColors,
  viewApplicationsButton: {
    marginRight: '10px',
  },
};

export default SummaryTable;
