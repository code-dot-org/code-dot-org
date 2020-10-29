/**
 * Table displaying workshop summaries based on a supplied workshop query result.
 */
import _, {orderBy} from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import color from '@cdo/apps/util/color';
import SessionTimesList from './session_times_list';
import FacilitatorsList from './facilitators_list';
import WorkshopManagement from './workshop_management';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import {workshopShape} from '../types.js';
import {Button} from 'react-bootstrap';
import {shouldShowSurveyResults} from '../workshop_summary_utils';

const styles = {
  container: {
    overflowX: 'auto'
  }
};

export default class WorkshopTable extends React.Component {
  static propTypes = {
    workshops: PropTypes.shape({
      limit: PropTypes.number,
      total_count: PropTypes.number,
      filters: PropTypes.object,
      workshops: PropTypes.arrayOf(workshopShape)
    }),
    onDelete: PropTypes.func,
    showSignupUrl: PropTypes.bool,
    showOrganizer: PropTypes.bool,
    showStatus: PropTypes.bool,
    tableId: PropTypes.string,
    moreUrl: PropTypes.string,
    onWorkshopsReceived: PropTypes.func,
    generateCaption: PropTypes.func,
    onSort: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  static defaultProps = {
    workshops: undefined,
    onDelete: null,
    showSignupUrl: false,
    showOrganizer: false,
    showStatus: false
  };

  componentWillMount() {
    if (this.props.onWorkshopsReceived) {
      this.props.onWorkshopsReceived(this.props.workshops);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      !_.isEqual(this.props.workshops, nextProps.workshops) &&
      this.props.onWorkshopsReceived
    ) {
      this.props.onWorkshopsReceived(nextProps.workshops);
    }
  }

  constructor(props) {
    super(props);
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

    this.state = {
      sortingColumns: {
        [sortColumnIndex]: {
          direction,
          position: 0
        }
      }
    };
  }

  constructColumns() {
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, {
      container: {whiteSpace: 'nowrap'},
      default: {color: color.light_gray}
    });

    let columns = [];
    columns.push(
      {
        property: 'manage',
        header: {
          label: 'Manage'
        },
        cell: {
          formatters: [this.formatManagement]
        }
      },
      {
        property: 'date', // for sorting
        header: {
          label: 'Date and Time',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatSessions]
        }
      },
      {
        property: 'location_name',
        header: {
          label: 'Location',
          transforms: [sortable]
        }
      },
      {
        property: 'on_map',
        header: {
          label: 'On Map',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatBoolean]
        }
      },
      {
        property: 'funded',
        header: {
          label: 'Funded',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatBoolean]
        }
      },
      {
        property: 'course',
        header: {
          label: 'Course',
          transforms: [sortable]
        }
      },
      {
        property: 'subject',
        header: {
          label: 'Subject',
          transforms: [sortable]
        }
      },
      {
        property: 'enrollments',
        header: {
          label: 'Signups',
          transforms: [sortable]
        }
      }
    );

    if (this.props.showOrganizer) {
      columns.push({
        property: 'organizer',
        header: {
          label: 'Organizer'
        },
        cell: {
          formatters: [this.formatOrganizer]
        }
      });
    }

    columns.push(
      {
        property: 'facilitators',
        header: {
          label: 'Facilitators'
        },
        cell: {
          formatters: [this.formatFacilitators]
        }
      },
      {
        property: 'regional_partner_name',
        header: {
          label: 'Regional Partner',
          transforms: [sortable]
        }
      }
    );

    columns.push();

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
          formatters: [this.formatSignupUrl]
        }
      });
    }

    this.columns = columns;
  }

  getSortingColumns = () => this.state.sortingColumns || {};

  onSort = selectedColumn => {
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
  };

  formatSessions = (_ignored, {rowData}) => {
    return <SessionTimesList sessions={rowData.sessions} />;
  };

  formatBoolean = bool => {
    return bool ? 'Yes' : 'No';
  };

  formatOrganizer = organizer => {
    return `${organizer.name} (${organizer.email})`;
  };

  formatFacilitators = facilitators => {
    return <FacilitatorsList facilitators={facilitators} />;
  };

  formatSignupUrl = workshopId => {
    const signupUrl = `${location.origin}/pd/workshops/${workshopId}/enroll`;
    return (
      <a href={signupUrl} target="_blank">
        {signupUrl}
      </a>
    );
  };

  formatManagement = manageData => {
    const {id, course, subject, state, date, canDelete, endDate} = manageData;

    return (
      <WorkshopManagement
        workshopId={id}
        course={course}
        subject={subject}
        viewUrl={`/workshops/${id}`}
        date={date}
        editUrl={state === 'Not Started' ? `/workshops/${id}/edit` : null}
        onDelete={canDelete ? this.props.onDelete : null}
        showSurveyUrl={shouldShowSurveyResults(
          state,
          course,
          subject,
          new Date(date)
        )}
        endDate={endDate}
      />
    );
  };

  handleMoreClick = event => {
    event.preventDefault();
    this.context.router.push(this.props.moreUrl);
  };

  render() {
    const rows = _.map(this.props.workshops.workshops, row =>
      _.merge(row, {
        enrollments: `${row.enrolled_teacher_count} / ${row.capacity}`,
        date: row.sessions[0].start,
        manage: {
          id: row.id,
          course: row.course,
          subject: row.subject,
          state: row.state,
          date: row.sessions[0].start,
          canDelete: row.can_delete,
          endDate: row.sessions[row.sessions.length - 1].end
        }
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
          {this.props.generateCaption && (
            <caption>{this.props.generateCaption()}</caption>
          )}
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
          {this.props.moreUrl &&
            this.props.workshops.total_count >
              this.props.workshops.workshops.length && (
              <tfoot>
                <tr>
                  <td>
                    <Button
                      bsSize="small"
                      href={this.props.moreUrl}
                      onClick={this.handleMoreClick}
                    >
                      {this.props.workshops.total_count -
                        this.props.workshops.workshops.length}{' '}
                      More...
                    </Button>
                  </td>
                </tr>
              </tfoot>
            )}
        </Table.Provider>
      </div>
    );
  }
}
