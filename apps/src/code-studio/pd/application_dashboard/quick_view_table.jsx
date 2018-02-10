import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {Table, sort} from 'reactabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import _, {orderBy} from 'lodash';
import { StatusColors } from './constants';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const styles = {
  table: {
    width: '100%',
  },
  statusCellCommon: {
    padding: '5px'
  },
  statusCell: StatusColors,
  notesCell: {
    maxWidth: '200px',
  },
  notesCellContent: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    paddingLeft: '2px'
  }
};

export class QuickViewTable extends React.Component {
  static propTypes = {
    showLocked: PropTypes.bool,
    path: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    statusFilter: PropTypes.string,
    regionalPartnerName: PropTypes.string,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    isWorkshopAdmin: PropTypes.bool
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
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

  formatBoolean(bool) {
    return bool ? "Yes" : "No";
  }

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
      property: 'created_at',
      header: {
        label: 'Submitted',
        transforms: [sortable]
      },
      cell: {
        format: (created_at) => {
          return new Date(created_at).toLocaleDateString('en-us', {month: 'long', day: 'numeric'});
        }
      }
    },{
      property: 'applicant_name',
      header: {
        label: 'Name',
        transforms: [sortable]
      },
    },{
      property: 'district_name',
      header: {
        label: 'School District',
        transforms: [sortable]
      },
    },{
      property: 'school_name',
      header: {
        label: 'School Name',
        transforms: [sortable]
      },
    },{
      property: 'status',
      header: {
        label: 'Status',
        transforms: [sortable]
      },
      cell: {
        format: (status) => {
          return _.upperFirst(status);
        },
        transforms: [
          (status) => ({
            style: {...styles.statusCellCommon, ...styles.statusCell[status]}
          })
        ]
      }
    });

    if (this.props.showLocked) {
      columns.push({
        property: 'locked',
        cell: {
          format: this.formatBoolean
        },
        header: {
          label: 'Locked?',
          transforms: [sortable]
        }
      });
    }

    if (this.props.viewType === 'teacher') {
      columns.push({
        property: 'principal_approval',
        header: {
          label: 'Principal Approval',
          transforms: [sortable]
        }
      }, {
        property: 'meets_criteria',
        header: {
          label: 'Meets Criteria',
          transforms: [sortable]
        }
      }, {
        property: 'total_score',
        header: {
          label: 'Total Score',
          transforms: [sortable]
        }
      });
    }

    columns.push({
      property: 'notes',
      header: {
        label: 'Notes'
      },
      cell: {
        format: this.formatNotesTooltip,
        transforms: [
          () => ({
            style: {...styles.notesCell}
          })
        ]
      }
    },{
      property: 'id',
      header: {
        label: 'View Application',
      },
      cell: {
        format: this.formatViewButton
      }
    });

    this.columns = columns;
  }

  getSortingColumns = () => this.state.sortingColumns || {};

  onSort = (selectedColumn) => {
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

  constructRows() {
    let rows = this.props.data;
    rows = this.props.statusFilter ? rows.filter(row => row.status === this.props.statusFilter) : rows;
    return rows;
  }

  formatNotesTooltip = (notes) => {
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

  formatViewButton = (id) => {
    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        href={this.context.router.createHref(`/${this.props.path}/${id}`)}
      >
        View Application
      </Button>
    );
  };

  render() {
    const rows = this.constructRows();

    const {sortingColumns} = this.state;
    const sortedRows = sort.sorter({
      columns: this.columns,
      sortingColumns,
      sort: orderBy
    })(rows);

    return (
      <Table.Provider
        className="pure-table table-striped"
        columns={this.columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default connect(state => ({
  showLocked: state.permissions.lockApplication,
  isWorkshopAdmin: state.permissions.workshopAdmin,
}))(QuickViewTable);
