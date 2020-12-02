import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import ReactTooltip from 'react-tooltip';
import * as Table from 'reactabular-table';
import * as sort from 'sortabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import _, {orderBy} from 'lodash';
import {StatusColors, getApplicationStatuses} from './constants';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';
import PrincipalApprovalButtons from './principal_approval_buttons';

const styles = {
  container: {
    overflowX: 'auto'
  },
  table: {
    width: '100%'
  },
  statusCellCommon: {
    padding: '5px'
  },
  statusCell: StatusColors,
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

export class QuickViewTable extends React.Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    applications: PropTypes.array.isRequired,
    statusFilter: PropTypes.string,
    regionalPartnerName: PropTypes.string,
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired,
    regionalPartnerGroup: PropTypes.number,
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
      },

      // track live in-memory changes, to avoid unnecessary API refresh
      applicationsDelta: {}
    };
  }

  showLocked = () => this.props.viewType === 'facilitator';

  handlePrincipalApprovalButtonsChange = (
    applicationId,
    principal_approval
  ) => {
    this.setState({
      applicationsDelta: {
        ...this.state.applicationsDelta,
        [applicationId]: {principal_approval}
      }
    });
  };

  formatBoolean(bool) {
    return bool ? 'Yes' : 'No';
  }

  constructColumns() {
    const sortable = wrappedSortable(this.getSortingColumns, this.onSort, {
      container: {whiteSpace: 'nowrap'},
      default: {color: color.light_gray}
    });

    let columns = [];
    columns.push(
      {
        property: 'id',
        header: {
          label: 'Actions'
        },
        cell: {
          formatters: [this.formatActionsCell]
        }
      },
      {
        property: 'created_at',
        header: {
          label: 'Submitted',
          transforms: [sortable]
        },
        cell: {
          formatters: [
            created_at =>
              new Date(created_at).toLocaleDateString('en-us', {
                month: 'long',
                day: 'numeric'
              })
          ]
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
        property: 'status',
        header: {
          label: 'Status',
          transforms: [sortable]
        },
        cell: {
          formatters: [
            status =>
              getApplicationStatuses(this.props.viewType)[status] ||
              _.upperFirst(status)
          ],
          transforms: [
            status => ({
              style: {...styles.statusCellCommon, ...styles.statusCell[status]}
            })
          ]
        }
      }
    );

    if (this.showLocked()) {
      columns.push({
        property: 'locked',
        cell: {
          formatters: [this.formatBoolean]
        },
        header: {
          label: 'Locked?',
          transforms: [sortable]
        }
      });
    }

    if (this.props.viewType === 'teacher') {
      columns.push(
        {
          property: 'principal_approval_state',
          header: {
            label: 'Principal Approval',
            transforms: [sortable]
          },
          cell: {
            formatters: [this.formatPrincipalApprovalCell]
          }
        },
        {
          property: 'meets_criteria',
          header: {
            label: 'Meets Guidelines',
            transforms: [sortable]
          }
        },
        {
          property: 'meets_scholarship_criteria',
          header: {
            label: 'Meets Scholarship Requirements',
            transforms: [sortable]
          }
        },
        {
          property: 'friendly_scholarship_status',
          header: {
            label: 'Scholarship Teacher?',
            transforms: [sortable]
          }
        }
      );
    } else {
      columns.push(
        {
          property: 'meets_criteria',
          header: {
            label: 'Meets Criteria',
            transforms: [sortable]
          }
        },
        {
          property: 'total_score',
          header: {
            label: 'Total Score',
            transforms: [sortable]
          }
        }
      );
    }

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

  constructRows() {
    let rows = this.props.applications;
    rows = this.props.statusFilter
      ? rows.filter(row => row.status === this.props.statusFilter)
      : rows;
    if (Object.keys(this.state.applicationsDelta).length > 0) {
      rows = rows.map(row => ({
        ...row,
        ...this.state.applicationsDelta[row.id]
      }));
    }
    return rows;
  }

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

  formatActionsCell = id => {
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

  formatPrincipalApprovalCell = (principal_approval_state, props) => {
    if (principal_approval_state) {
      return (
        <div>
          <span>{principal_approval_state}</span>
          <PrincipalApprovalButtons
            applicationId={props.rowData.id}
            showResendEmailButton={props.rowData.allow_sending_principal_email}
            onChange={this.handlePrincipalApprovalButtonsChange}
          />
        </div>
      );
    }

    return (
      <div>
        <PrincipalApprovalButtons
          applicationId={props.rowData.id}
          showSendEmailButton={true}
          showNotRequiredButton={true}
          onChange={this.handlePrincipalApprovalButtonsChange}
        />
      </div>
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
      <div style={styles.container}>
        <Table.Provider
          id="quick-view"
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

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartners.regionalPartnerGroup,
  isWorkshopAdmin: state.applicationDashboard.permissions.workshopAdmin
}))(QuickViewTable);
