/**
 * Table displaying workshop summaries based on a supplied query.
 */

import _, {orderBy} from 'lodash';
import React from 'react';
import {Button} from 'react-bootstrap';
import {Table, sort} from 'reactabular';
import color from '../../../../color';
import SessionTimesList from './session_times_list';
import FacilitatorsList from './facilitators_list';
import WorkshopManagement from './workshop_management';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const WorkshopTable = React.createClass({
  propTypes: {
    workshops: React.PropTypes.arrayOf(
      React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        sessions: React.PropTypes.array.isRequired,
        location_name: React.PropTypes.string.isRequired,
        workshop_type: React.PropTypes.string.isRequired,
        course: React.PropTypes.string.isRequired,
        enrolled_teacher_count: React.PropTypes.number.isRequired,
        capacity: React.PropTypes.number.isRequired,
        facilitators: React.PropTypes.array.isRequired,
        organizer: React.PropTypes.shape({
          name: React.PropTypes.string.isRequired,
          email: React.PropTypes.string.isRequired
        }).isRequired
      })
    ),
    canEdit: React.PropTypes.bool,
    onDelete: React.PropTypes.func,
    showSignupUrl: React.PropTypes.bool,
    showOrganizer: React.PropTypes.bool
  },

  getDefaultProps() {
    return {
      canEdit: false,
      onDelete: null,
      showSignupUrl: false,
      showOrganizer: false
    };
  },

  getInitialState() {
    return {
      sortingColumns: {
        0: {
          direction: 'asc',
          position: 0
        }
      }
    };
  },

  getSortingColumns() {
    return this.state.sortingColumns || {};
  },

  onSort(selectedColumn) {
    const sortingColumns = sort.byColumn({
      sortingColumns: this.state.sortingColumns,
      // Custom sortingOrder removes 'no-sort' from the cycle
      sortingOrder: {
        FIRST: 'asc',
        asc: 'desc',
        desc: 'asc'
      },
      selectedColumn
    });

    this.setState({
      sortingColumns: sort.byColumn({
        sortingColumns
      })
    });
  },

  formatSessions(_ignored, {rowData}) {
    return <SessionTimesList sessions={rowData.sessions}/>;
  },

  formatOrganizer(organizer) {
    return `${organizer.name} (${organizer.email})`;
  },

  formatFacilitators(facilitators) {
    return <FacilitatorsList facilitators={facilitators} />;
  },

  formatSignupUrl(workshopId) {
    const signupUrl = `${location.origin}/pd/workshops/${workshopId}/enroll`;
    return (
      <a href={signupUrl} target="_blank">
        {signupUrl}
      </a>
    );
  },

  formatManagement(workshopId) {
    return (
      <WorkshopManagement
        workshopId={workshopId}
        viewUrl={`/workshops/${workshopId}`}
        editUrl={this.props.canEdit ? `/workshops/${workshopId}/edit` : null}
        onDelete={this.props.onDelete}
      />
    );
  },

  render() {
    const rows = _.map(this.props.workshops,
      row => _.merge(row, {
        signups: `${row.enrolled_teacher_count} / ${row.capacity}`,
        firstSessionStart: row.sessions[0].start
      })
    );

    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      {
        default: {color: color.light_gray}
      }
    );

    let columns = [];
    columns.push({
      property: 'firstSessionStart', // for sorting
      header: {
        label: 'Date and Time',
        transforms: [sortable]
      },
      cell: {
        format: this.formatSessions
      }
    }, {
      property: 'location_name',
      header: {
        label: 'Location',
        transforms: [sortable]
      }
    }, {
      property: 'workshop_type',
      header: {
        label: 'Type',
        transforms: [sortable]
      }
    }, {
      property: 'course',
      header: {
        label: 'Course',
        transforms: [sortable]
      }
    }, {
      property: 'signups',
      header: {
        label: 'Signups',
        transforms: [sortable]
      }
    });

    if (this.props.showOrganizer) {
      columns.push({
        property: 'organizer',
        header: {
          label: 'Organizer',
          transforms: [sortable]
        },
        cell: {
          format: this.formatOrganizer
        }
      });
    }

    columns.push({
      property: 'facilitators',
      header: {
        label: 'Facilitators',
        transforms: [sortable]
      },
      cell: {
        format: this.formatFacilitators
      }
    });

    if (this.props.showSignupUrl) {
      columns.push({
        property: 'id',
        header: {
          label: 'Signup Url'
        },
        cell: {
          format: this.formatSignupUrl
        }
      });
    }

    columns.push({
      property: 'id',
      header: {
        label: 'Manage'
      },
      cell: {
        format: this.formatManagement
      }
    });

    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <Table.Provider
        className="table table-striped table-condensed"
        columns={columns}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id"/>
      </Table.Provider>
    );
  }
});
export default WorkshopTable;
