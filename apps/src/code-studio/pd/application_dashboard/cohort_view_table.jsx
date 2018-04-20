import React, {PropTypes} from 'react';
import { connect } from 'react-redux';
import {Table, sort} from 'reactabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import _, {orderBy} from 'lodash';
import { StatusColors } from './constants';
import moment from 'moment';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const styles = {
  table: {
    width: '100%'
  },
  statusCellCommon: {
    padding: '5px'
  },
  statusCell: StatusColors
};

export class CohortViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    viewType: PropTypes.oneOf(['facilitator', 'teacher']).isRequired,
    regionalPartnerGroup: PropTypes.number,
    isWorkshopAdmin: PropTypes.bool
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

  showLocked = () => (
    this.props.isWorkshopAdmin
    || this.props.viewType === 'facilitator'
    || (this.props.viewType ==='teacher' && this.props.regionalPartnerGroup === 3)
  );

  constructColumns() {
    const sortable = wrappedSortable(
      this.getSortingColumns,
      this.onSort,
      {
        container: {whiteSpace: 'nowrap'},
        default: {color: color.light_gray}
      }
    );

    let columns = [
      {
        property: 'date_accepted',
        header: {
          label: 'Date Accepted',
          transforms: [sortable]
        },
        cell: {
          format: this.formatDate
        }
      }, {
        property: 'applicant_name',
        header: {
          label: 'Name',
          transforms: [sortable]
        }
      }, {
        property: 'district_name',
        header: {
          label: 'School District',
          transforms: [sortable]
        }
      }, {
        property: 'school_name',
        header: {
          label: 'School Name',
          transforms: [sortable]
        }
      }, {
        property: 'email',
        header: {
          label: 'Email',
          transforms: [sortable]
        }
      }, {
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
      }
    ];

    if (this.showLocked()) {
      columns.push({
        property: 'locked',
        header: {
          label: 'Locked'
        },
        cell: {
          format: this.formatBoolean
        }
      });
    }

    if (this.props.viewType === 'facilitator') {
      columns.push({
          property: 'assigned_fit',
          header: {
            label: 'Assigned FIT',
            transforms: [sortable]
          }
        }, {
          property: 'registered_fit',
          header: {
            label: 'Registered FIT',
            transforms: [sortable]
          }
        }
      );
    }

    columns.push({
      property: 'assigned_workshop',
      header: {
        label: 'Assigned Workshop',
        transforms: [sortable]
      }
    }, {
      property: 'registered_workshop',
      header: {
        label: 'Registered Workshop',
        transforms: [sortable]
      }
    }, {
      property: 'id',
      header: {
        label: 'View Application'
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

  // Format dates as abbreviated month and day, e.g. "Mar 9"
  formatDate = (iso8601Date) => moment(iso8601Date).format("MMM D");

  formatBoolean = (bool) => bool ? "Yes" : "No";

  formatViewButton = (id) => {
    return (
      <Button
        bsSize="xsmall"
        target="_blank"
        // TODO: (mehal) Build a wrapper for react stories that lets us pass in a context with router
        href={this.context.router && this.context.router.createHref(`/${this.props.path.replace('_cohort', '')}/${id}`)}
      >
        View Application
      </Button>
    );
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
      <Table.Provider
        id="cohort-view"
        className="pure-table table-striped"
        columns={this.columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={sortedRows} rowKey="id"/>
      </Table.Provider>
    );
  }
}

export default connect(state => ({
  regionalPartnerGroup: state.regionalPartnerGroup,
  isWorkshopAdmin: state.permissions.workshopAdmin
}))(CohortViewTable);
