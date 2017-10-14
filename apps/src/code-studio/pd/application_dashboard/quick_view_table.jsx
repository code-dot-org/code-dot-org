import React from 'react';
import {Table} from 'reactabular';

export default class QuickViewTable extends React.Component {

  render() {
    const rows = [
      {
        id: 1,
        created_at: "2017-10-10 14:06:04 -0700",
        name: "Minerva McGonagall",
        district: "Hogsmeade Central School District",
        school: "Hogwarts School of Witchcraft and Wizardry",
        principal: "Albus Dumbledore",
        status: "unreviewed",
        locked_at: null,
        notes: "Animagus"
      }
    ];

    const columns = [
      {
        property: 'created_at',
        header: {
          label: 'Date Submitted',
        },
      },
      {
        property: 'name',
        header: {
          label: 'Name',
        },
      },
      {
        property: 'district',
        header: {
          label: 'District',
        },
      },
      {
        property: 'school',
        header: {
          label: 'School',
        },
      },
      {
        property: 'principal',
        header: {
          label: 'Principal',
        },
      },
      {
        property: 'status',
        header: {
          label: 'Status',
        },
      },
      {
        property: 'locked_at',
        header: {
          label: 'Locked',
        },
        cell: {
          formatters: [
            locked_at => locked_at ? 'Yes' : 'No'
          ]
        }
      },
      {
        property: 'notes',
        header: {
          label: 'Notes',
        }
      },
      {
        header: {
          label: 'Button',
        }
      }
    ];

    return (
      <Table.Provider
        className="pure-table pure-table-striped"
        columns={columns}
      >
        <Table.Header />

        <Table.Body rows={rows} rowKey="id" />
      </Table.Provider>
    );
  }

}
