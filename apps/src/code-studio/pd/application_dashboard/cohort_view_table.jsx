import React, {PropTypes} from 'react';
import {Table, sort} from 'reactabular';
import color from '@cdo/apps/util/color';
import {Button} from 'react-bootstrap';
import {orderBy} from 'lodash';
import wrappedSortable from '@cdo/apps/templates/tables/wrapped_sortable';

const styles = {
  table: {
    width: '100%'
  }
};

export default class CohortViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
    path: PropTypes.string.isRequired,
    viewType: PropTypes.oneOf(['facilitator', 'teacher']).isRequired
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
      }
    ];

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
    } else {
      columns.push(
        {
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
        }
      );
    }

    columns.push({
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

  formatViewButton = (id) => {
    return (
      <Button
        bsSize="xsmall"
        // TODO: (mehal) Build a wrapper for react stories that lets us pass in a context with router
        href={this.context.router && this.context.router.createHref(`/${this.props.path.replace('_cohort', '')}/${id}`)}
        onClick={this.handleViewClick.bind(this, id)}
      >
        View Application
      </Button>
    );
  };

  handleViewClick = (id, event) => {
    event.preventDefault();
    this.context.router.push(`/${this.props.path.replace('_cohort', '')}/${id}`);
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
