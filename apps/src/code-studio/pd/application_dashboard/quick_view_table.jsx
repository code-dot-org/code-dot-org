import React, {PropTypes} from 'react';
import ReactTooltip from 'react-tooltip';
import {Table} from 'reactabular';
import {Button} from 'react-bootstrap';
import _ from 'lodash';
import {
  StatusColors,
  RegionalPartnerDropdownOptions
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

export default class QuickViewTable extends React.Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    statusFilter: PropTypes.string,
    regionalPartnerFilter: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number
    ])
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

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
    },{
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
      if (this.props.regionalPartnerFilter === RegionalPartnerDropdownOptions.unmatched.value) {
        rows = rows.filter(row => row.regional_partner_id === null);
      } else if (this.props.regionalPartnerFilter !== RegionalPartnerDropdownOptions.all.value) {
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
