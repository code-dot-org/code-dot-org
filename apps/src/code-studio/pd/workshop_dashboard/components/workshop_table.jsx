/**
 * Table displaying workshop summaries based on a supplied workshop query result.
 */

import _, {orderBy} from 'lodash';
import React from 'react';
import {Table, sort} from 'reactabular';
import color from '@cdo/apps/util/color';
import SessionTimesList from './session_times_list';
import FacilitatorsList from './facilitators_list';
import WorkshopManagement from './workshop_management';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import {workshopShape} from '../types.js';
import {Button} from 'react-bootstrap';

const styles = {
  container: {
    overflowX: 'auto'
  }
};

const WorkshopTable = React.createClass({
  propTypes: {
    workshops: React.PropTypes.shape({
      limit: React.PropTypes.number,
      total_count: React.PropTypes.number,
      filters: React.PropTypes.object,
      workshops: React.PropTypes.arrayOf(workshopShape)
    }),
    onDelete: React.PropTypes.func,
    showSignupUrl: React.PropTypes.bool,
    showOrganizer: React.PropTypes.bool,
    showStatus: React.PropTypes.bool,
    tableId: React.PropTypes.string,
    moreUrl: React.PropTypes.string,
    onWorkshopsReceived: React.PropTypes.func,
    generateCaption: React.PropTypes.func,
    onSort: React.PropTypes.func
  },

  contextTypes: {
    router: React.PropTypes.object.isRequired
  },

  getDefaultProps() {
    return {
      workshops: undefined,
      onDelete: null,
      showSignupUrl: false,
      showOrganizer: false,
      showStatus: false
    };
  },

  componentWillMount() {
    if (this.props.onWorkshopsReceived) {
      this.props.onWorkshopsReceived(this.props.workshops);
    }
  },

  componentWillReceiveProps(nextProps) {
    if (!_.isEqual(this.props.workshops, nextProps.workshops) && this.props.onWorkshopsReceived) {
      this.props.onWorkshopsReceived(nextProps.workshops);
    }
  },

  getInitialState() {
    this.constructColumns();

    // default
    let sortColumnIndex = 0;
    let direction = 'desc';

    // already ordered? reflect that in the sort columns
    const sortedBy = this.props.workshops.filters.order_by;
    if (sortedBy) {
      const property = sortedBy.split(' ')[0];
      sortColumnIndex = this.columns.findIndex(c => c.property === property);
      direction = sortedBy.split(' ')[1];
    }

    return {
      sortingColumns: {
        [sortColumnIndex]: {
          direction,
          position: 0
        }
      }
    };
  },

  constructColumns() {
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      {
        container: {whiteSpace: 'nowrap'},
        default: {color: color.light_gray}
      }
    );

    let columns = [];
    columns.push({
      property: 'date', // for sorting
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
      property: 'subject',
      header: {
        label: 'Subject',
        transforms: [sortable]
      }
    }, {
      property: 'enrollments',
      header: {
        label: 'Signups',
        transforms: [sortable]
      }
    });

    if (this.props.showOrganizer) {
      columns.push({
        property: 'organizer',
        header: {
          label: 'Organizer'
        },
        cell: {
          format: this.formatOrganizer
        }
      });
    }

    columns.push({
      property: 'facilitators',
      header: {
        label: 'Facilitators'
      },
      cell: {
        format: this.formatFacilitators
      }
    });

    if (this.props.showStatus) {
      columns.push({
        property: 'state',
        header: {
          label: 'Status',
          transforms: [sortable]
        }
      });
    }

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
      property: 'manage',
      header: {
        label: 'Manage'
      },
      cell: {
        format: this.formatManagement
      }
    });

    this.columns = columns;
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

    const columnIndex = _.keys(sortingColumns)[0];
    const sortDescription = {
      property: this.columns[columnIndex].property,
      direction: sortingColumns[columnIndex].direction
    };

    if (this.props.onSort) {
      this.props.onSort(sortDescription);
    }

    this.setState({sortingColumns});
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

  formatManagement(manageData) {
    const {id, state} = manageData;
    const isPlp = window.dashboard.workshop.permission.indexOf('plp') >= 0;
    const surveyBaseUrl = isPlp ? "/organizer_survey_results" : "/survey_results";

    return (
      <WorkshopManagement
        workshopId={id}
        viewUrl={`/workshops/${id}`}
        editUrl={state === 'Not Started' ? `/workshops/${id}/edit` : null}
        onDelete={state !== 'Ended' ? this.props.onDelete : null}
        surveyUrl={state === 'Ended' && surveyBaseUrl ? `${surveyBaseUrl}/${id}` : null}
      />
    );
  },

  handleMoreClick(event) {
    event.preventDefault();
    this.context.router.push(this.props.moreUrl);
  },

  render() {
    const rows = _.map(this.props.workshops.workshops,
      row => _.merge(row, {
        enrollments: `${row.enrolled_teacher_count} / ${row.capacity}`,
        date: row.sessions[0].start,
        manage: {id: row.id, state: row.state}
      })
    );

    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns: this.columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <div style={styles.container}>
        <Table.Provider
          id={this.props.tableId}
          className="table table-striped table-condensed"
          columns={this.columns}
        >
          {this.props.generateCaption && <caption>{this.props.generateCaption()}</caption>}
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id"/>
          {
            this.props.moreUrl && this.props.workshops.total_count > this.props.workshops.workshops.length &&
            <tfoot>
            <tr>
              <td>
                <Button
                  bsSize="small"
                  href={this.props.moreUrl}
                  onClick={this.handleMoreClick}
                >
                  {this.props.workshops.total_count - this.props.workshops.workshops.length} More...
                </Button>
              </td>
            </tr>
            </tfoot>
          }
        </Table.Provider>
      </div>
    );
  }
});
export default WorkshopTable;
