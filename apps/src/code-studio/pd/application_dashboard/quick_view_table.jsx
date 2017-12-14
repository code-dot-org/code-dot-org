import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import ReactTooltip from 'react-tooltip';
import {Table} from 'reactabular';
import {Button} from 'react-bootstrap';
import _ from 'lodash';
import {
  StatusColors,
  UnmatchedFilter,
  AllPartnersFilter
} from './constants';

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
    regionalPartnerFilter: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ]),
    viewType: PropTypes.oneOf(['teacher', 'facilitator']).isRequired
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  formatBoolean(bool) {
    return bool ? "Yes" : "No";
  }

  constructColumns() {
    let columns = [];
    columns.push({
      property: 'created_at',
      header: {
        label: 'Submitted',
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
      },
    },{
      property: 'district_name',
      header: {
        label: 'School District',
      },
    },{
      property: 'school_name',
      header: {
        label: 'School Name',
      },
    },{
      property: 'status',
      header: {
        label: 'Status',
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
        }
      });
    }

    if (this.props.viewType === 'teacher') {
      columns.push({
        property: 'principal_approval',
        header: {
          label: 'Principal Approval'
        }
      }, {
        property: 'meets_criteria',
        header: {
          label: 'Meets Criteria'
        }
      }, {
        property: 'total_score',
        header: {
          label: 'Total Score'
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

    return columns;
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
        href={this.context.router.createHref(`/${this.props.path}/${id}`)}
        onClick={this.handleViewClick.bind(this, id)}
      >
        View Application
      </Button>
    );
  };

  handleViewClick = (id, event) => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path}/${id}`);
  };

  constructRows() {
    let rows = this.props.data;
    if (this.props.regionalPartnerFilter) {
      if (this.props.regionalPartnerFilter === UnmatchedFilter) {
        rows = rows.filter(row => row.regional_partner_id === null);
      } else if (this.props.regionalPartnerFilter !== AllPartnersFilter) {
        rows = rows.filter(row => row.regional_partner_id === this.props.regionalPartnerFilter);
      }
    }
    rows = this.props.statusFilter ? rows.filter(row => row.status === this.props.statusFilter) : rows;
    return rows;
  }

  render() {
    const rows = this.constructRows();
    const columns = this.constructColumns();

    return (
      <Table.Provider
        className="pure-table table-striped"
        columns={columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={rows} rowKey="id" />
      </Table.Provider>
    );
  }
}

export default connect(state => ({
  showLocked: state.permissions.lockApplication,
}))(QuickViewTable);
