import React, {PropTypes} from 'react';
import {Table} from 'reactabular';
import {Button} from 'react-bootstrap';
import color from '@cdo/apps/util/color';
import _ from 'lodash';

const styles = {
  table: {
    width: '100%',
  }
};

export default class QuickViewTable extends React.Component {
  static propTypes = {
    path: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired
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
            style: {
              backgroundColor: this.getViewColor(status),
              padding: '5px'
            }
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

  getViewColor = (status) => {
    switch (status) {
      case 'unreviewed': return color.charcoal;
      case 'pending': return color.orange;
      case 'accepted': return color.level_perfect;
      case 'declined': return color.red;
      case 'waitlisted': return color.level_passed;
    }
  }

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

  render() {
    const rows = this.props.data;
    const columns = this.constructColumns();

    return (
      <Table.Provider
        className="pure-table pure-table-striped"
        columns={columns}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={rows} rowKey="id" />
      </Table.Provider>
    );
  }
}
