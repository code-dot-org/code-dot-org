/**
 * Table that gets workshop data from a supplied url,
 * displays the results, possibly limited, and allows sorting.
 * Sort happens on the client when all workshops are loaded,
 * and by re-querying the server for another limited ordered set when it's limited.
 */

import PropTypes from 'prop-types';
import React from 'react';

import WorkshopTable from './workshop_table';
import WorkshopTableLoader from './workshop_table_loader';

export default class ServerSortWorkshopTable extends React.Component {
  static propTypes = {
    queryUrl: PropTypes.string,
    queryParams: PropTypes.object,
    tableId: PropTypes.string,
    canDelete: PropTypes.bool,
    showStatus: PropTypes.bool,
    showSignupUrl: PropTypes.bool,
    showOrganizer: PropTypes.bool,
    generateCaptionFromWorkshops: PropTypes.func,
    moreUrl: PropTypes.string,
  };

  constructor(props) {
    super(props);
    this.state = {orderBy: 'date desc'};
  }

  handleWorkshopsReceived = workshops => {
    this.workshops = workshops;
  };

  generateCaption = () => {
    if (this.workshops && this.props.generateCaptionFromWorkshops) {
      return this.props.generateCaptionFromWorkshops(this.workshops);
    }
  };

  handleTableSort = sort => {
    const limit = this.workshops.limit;
    const workshopCount = this.workshops.total_count;

    // As an optimization, only re-query with an orderBy when fewer than all workshops are loaded.
    // In the case where all workshops are loaded, they can be sorted in the client.
    if (limit && workshopCount > limit) {
      this.setState({orderBy: `${sort.property} ${sort.direction}`});
    }
  };

  render() {
    const queryParams = {
      ...this.props.queryParams,
      order_by: this.state.orderBy,
    };

    return (
      <WorkshopTableLoader
        queryUrl={this.props.queryUrl}
        queryParams={queryParams}
        canDelete={this.props.canDelete}
      >
        <WorkshopTable
          tableId={this.props.tableId}
          showStatus={this.props.showStatus}
          showSignupUrl={this.props.showSignupUrl}
          showOrganizer={this.props.showOrganizer}
          onWorkshopsReceived={this.handleWorkshopsReceived}
          generateCaption={this.generateCaption}
          onSort={this.handleTableSort}
          moreUrl={this.props.moreUrl}
        />
      </WorkshopTableLoader>
    );
  }
}
