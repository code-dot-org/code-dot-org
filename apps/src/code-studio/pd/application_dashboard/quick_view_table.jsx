import React from 'react';
import {Table} from 'reactabular';

const styles = {
  table: {
    width: '100%',
  }
};

export default class QuickViewTable extends React.Component {
  render() {
    const rows = [
      {
        id: 1,
        created_at: "October 17",
        name: "Minerva McGonagall",
        district_name: "Hogsmeade Central School District",
        school_name: "Hogwarts School of Witchcraft and Wizardry",
        status: "accepted"
      },
      {
        id: 2,
        created_at: "October 23",
        name: "Severus Snape",
        district_name: "Hogsmeade Central School District",
        school_name: "Hogwarts School of Witchcraft and Wizardry",
        status: "unreviewed"
      },
      {
        id: 3,
        created_at: "October 19",
        name: "Argus Filch",
        district_name: "Hogsmeade Central School District",
        school_name: "Hogwarts School of Witchcraft and Wizardry",
        status: "declined"
      }
    ];

    const columns = [
      {
        property: 'created_at',
        header: {
          label: 'Submitted',
        },
      },
      {
        property: 'name',
        header: {
          label: 'Name',
        },
      },
      {
        property: 'district_name',
        header: {
          label: 'School District',
        },
      },
      {
        property: 'school_name',
        header: {
          label: 'School Name',
        },
      },
      {
        property: 'status',
        header: {
          label: 'Status',
        },
      },
      {
        header: {
          label: '',
        }
      }
    ];

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
