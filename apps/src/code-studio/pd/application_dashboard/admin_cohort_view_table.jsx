import PropTypes from 'prop-types';
import React from 'react';
import ReactTooltip from 'react-tooltip';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import _, {orderBy} from 'lodash';
import moment from 'moment';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const styles = {
  container: {
    overflowX: 'auto'
  },
  table: {
    width: '100%'
  },
  sortableColumnHeader: {
    container: {
      display: 'flex',
      alignItems: 'center'
    },
    default: {
      color: color.light_gray
    }
  },
  notesCell: {
    maxWidth: '200px'
  },
  notesCellContent: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '2px'
  }
};

export default class AdminCohortViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired
  };

  static contextTypes = {
    router: PropTypes.object
  };

  constructor(props) {
    super(props);
    this.constructColumns();

    // default
    let sortColumnIndex = 0;
    let direction = 'desc';

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
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      styles.sortableColumnHeader
    );

    let columns = [
      {
        property: 'id',
        header: {
          label: 'View Application'
        },
        cell: {
          formatters: [this.formatViewButton]
        }
      },
      {
        property: 'date_accepted',
        header: {
          label: 'Date Accepted',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatDate]
        }
      },
      {
        property: 'applicant_name',
        header: {
          label: 'Name',
          transforms: [sortable]
        }
      },
      {
        property: 'role',
        header: {
          label: 'Role',
          transforms: [sortable]
        }
      },
      {
        property: 'status',
        header: {
          label: 'Status',
          transforms: [sortable]
        }
      },
      {
        property: 'locked',
        header: {
          label: 'Locked',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatBoolean]
        }
      },
      {
        property: 'regional_partner_name',
        header: {
          label: 'Regional Partner',
          transforms: [sortable]
        }
      },
      {
        property: 'district_name',
        header: {
          label: 'School District',
          transforms: [sortable]
        }
      },
      {
        property: 'school_name',
        header: {
          label: 'School Name',
          transforms: [sortable]
        }
      },
      {
        property: 'email',
        header: {
          label: 'Email',
          transforms: [sortable]
        }
      },
      {
        property: 'assigned_workshop',
        header: {
          label: 'Assigned Workshop',
          transforms: [sortable]
        }
      },
      {
        property: 'registered_workshop',
        header: {
          label: 'Registered Workshop',
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatBoolean]
        }
      },
      {
        property: 'assigned_fit',
        header: {
          label: 'Assigned FiT',
          transforms: [sortable]
        }
      },
      {
        property: 'registered_fit_submission_time',
        header: {
          label: 'Registered FiT',
          transforms: [sortable]
        }
      },
      {
        property: 'accepted_fit',
        header: {
          label: 'Accepted FiT',
          transforms: [sortable]
        }
      }
    ];

    [
      {property: 'notes', label: 'General Notes'},
      {property: 'notes_2', label: 'Notes 2'},
      {property: 'notes_3', label: 'Notes 3'},
      {property: 'notes_4', label: 'Notes 4'},
      {property: 'notes_5', label: 'Notes 5'}
    ].forEach(notesField => {
      columns.push({
        property: notesField.property,
        header: {
          label: notesField.label,
          transforms: [sortable]
        },
        cell: {
          formatters: [this.formatNotesTooltip],
          transforms: [
            () => ({
              style: {...styles.notesCell}
            })
          ]
        }
      });
    });

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

    this.setState({sortingColumns});
  };

  // Format dates as abbreviated month and day, e.g. "Mar 9"
  formatDate = iso8601Date =>
    iso8601Date ? moment(iso8601Date).format('MMM D') : '';

  formatBoolean = bool => (bool ? 'Yes' : 'No');

  formatNotesTooltip = notes => {
    let tooltipId = _.uniqueId();
    return (
      <div>
        <div
          data-tip
          data-for={tooltipId}
          aria-describedby={tooltipId}
          style={styles.notesCellContent}
        >
          {notes}
        </div>
        <ReactTooltip
          id={tooltipId}
          role="tooltip"
          wrapper="span"
          effect="solid"
        >
          {notes}
        </ReactTooltip>
      </div>
    );
  };

  formatViewButton = (id, {rowData}) => {
    if (!rowData.type.startsWith('Pd::Application')) {
      return null;
    }

    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        href={this.context.router && this.context.router.createHref(`/${id}`)}
        onClick={this.handleViewClick.bind(this, id)}
      >
        View Application
      </Button>
    );
  };

  handleViewClick = (id, event) => {
    event.preventDefault();
    this.context.router.push(`/${id}`);
  };

  render() {
    const rows = this.props.data;

    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns: this.columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <div style={styles.container}>
        <Table.Provider
          id="cohort-view"
          className="pure-table table-striped"
          columns={this.columns}
          style={styles.table}
        >
          <Table.Header />
          <Table.Body rows={sortedRows} rowKey="id" />
        </Table.Provider>
      </div>
    );
  }
}
