/**
 * Table that gets workshop data from a supplied url,
 * displays the results, possibly limited, and allows sorting.
 * Sort happens on the client when all workshops are loaded,
 * and by re-querying the server for another limited ordered set when it's limited.
 */

import React from 'react';
import WorkshopTableLoader from './workshop_table_loader';
import WorkshopTable from './workshop_table';

const ServerSortWorkshopTable = React.createClass({
  propTypes: {
    queryUrl: React.PropTypes.string,
    params: React.PropTypes.object,
    tableId: React.PropTypes.string,
    canDelete: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    showSignupUrl: React.PropTypes.bool,
    showOrganizer: React.PropTypes.bool,
    generateCaptionFromWorkshops: React.PropTypes.func,
    moreUrl: React.PropTypes.string
  },

  getInitialState() {
    return {
      orderBy: undefined
    };
  },

  handleWorkshopsReceived(workshops) {
    this.workshops = workshops;
  },

  generateCaption() {
    if (this.workshops && this.props.generateCaptionFromWorkshops) {
      return this.props.generateCaptionFromWorkshops(this.workshops);
    }
  },

  handleTableSort(sort) {
    const limit = this.workshops.limit;
    const workshopCount = this.workshops.total_count;

    // As an optimization, only re-query with an oderBy when fewer than all workshops are loaded.
    // In the case where all workshops are loaded, they can be sorted in the client.
    if (limit && workshopCount > limit) {
      this.setState({orderBy: `${sort.property} ${sort.direction}`});
    }
  },

  render() {
    const params = {
      ...this.props.params,
      order_by: this.state.orderBy
    };

    return (
      <WorkshopTableLoader
        queryUrl={this.props.queryUrl}
        params={params}
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
});
export default ServerSortWorkshopTable;
