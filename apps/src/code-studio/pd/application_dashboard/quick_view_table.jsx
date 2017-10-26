import React, {PropTypes} from 'react';
import {Table} from 'reactabular';
import {Button} from 'react-bootstrap';

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
      property: 'name',
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

  formatViewButton = (id) => {
    return (
      <Button
        bsSize="xsmall"
        href={this.context.router.createHref(`/${this.props.path}/${id}`)}
        onClick={this.handleViewClick}
      >
        View Application
      </Button>
    );
  }

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
