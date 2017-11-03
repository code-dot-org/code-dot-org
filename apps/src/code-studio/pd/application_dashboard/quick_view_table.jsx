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
          if (status === 'move_to_interview') {
            return 'Move to Interview';
          }
          return _.upperFirst(status);
        },
        transforms: [
          (status) => ({
            style: {
              backgroundColor: this.getViewColor(status),
              color: this.getTextColor(status),
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
      case 'pending': return color.lighter_orange;
      case 'accepted': return color.level_perfect;
      case 'declined': return color.red;
      case 'waitlisted': return color.level_passed;
      case 'move_to_interview': return color.orange;
      case 'withdrawn': return color.lightest_red;
    }
  }

  getTextColor = (status) => {
    if (status === 'declined' || status === 'unreviewed') {
      return color.white;
    }
    return color.black;
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
