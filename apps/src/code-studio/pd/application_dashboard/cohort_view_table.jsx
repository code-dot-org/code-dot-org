import React, {PropTypes} from 'react';
import {Table} from 'reactabular';

const styles = {
  table: {
    width: '100%'
  }
};

export default class CohortViewTable extends React.Component {
  static propTypes = {
    data: PropTypes.array.isRequired,
  }

  constructColumns() {
    return [
      {
        property: 'date_accepted',
        header: {
          label: 'Date Accepted'
        },
        cell: {
          format: (date_accepted) => {
            return new Date(date_accepted).toLocaleDateString('en-us', {month: 'long', day: 'numeric'});
          }
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
      }, {
        property: 'registered_for_summer_workshop',
        header: {
          label: 'Registered Summer Workshop'
        }
      }
    ];
  }

  render() {
    return (
      <Table.Provider
        className="pure-table table-striped"
        columns={this.constructColumns()}
        style={styles.table}
      >
        <Table.Header />
        <Table.Body rows={this.props.data} rowKey="email"/>
      </Table.Provider>
    );
  }
}
