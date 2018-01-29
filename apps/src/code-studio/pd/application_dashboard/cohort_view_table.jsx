import React, {PropTypes} from 'react';
import {Table} from 'reactabular';
import {Button} from 'react-bootstrap';

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

  constructColumns() {
    let columns = [
      {
        property: 'date_accepted',
        header: {
          label: 'Date Accepted'
        }
      }, {
        property: 'applicant_name',
        header: {
          label: 'Name'
        }
      }, {
        property: 'district_name',
        header: {
          label: 'School District'
        }
      }, {
        property: 'school_name',
        header: {
          label: 'School Name'
        }
      }, {
        property: 'email',
        header: {
          label: 'Email'
        }
      }
    ];

    if (this.props.viewType === 'facilitator') {
      columns.push({
          property: 'assigned_fit',
          header: {
            label: 'Assigned FIT'
          }
        }, {
          property: 'registered_fit',
          header: {
            label: 'Registered FIT'
          }
        }
      );
    } else {
      columns.push(
        {
          property: 'assigned_workshop',
          header: {
            label: 'Assigned Workshop'
          }
        }, {
          property: 'registered_workshop',
          header: {
            label: 'Registered Workshop'
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

    return columns;
  }

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
    return (
      <Table.Provider
        className="pure-table table-striped"
        columns={this.constructColumns()}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={this.props.data} rowKey="id"/>
      </Table.Provider>
    );
  }
}
