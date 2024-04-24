import React from 'react';
import * as Table from 'reactabular-table';

const TroubleshooterPage = () => {
  const columns = [
    {
      property: 'name',
      header: {
        label: 'Name',
      },
    },
    {
      property: 'status',
      header: {
        label: 'Status',
      },
    },
  ];

  const rows = [
    {
      name: 'Browser',
      status: 'Pass',
    },
    {
      name: 'Can reach Code.org?',
      status: 'Pass',
    },
  ];

  return (
    <Table.Provider
      style={{width: '1000px'}}
      columns={columns}
      className="ui-personal-projects-table"
    >
      <Table.Header />
      <Table.Body
        rows={rows}
        rowKey="channel"
        className="ui-personal-projects-row"
      />
    </Table.Provider>
  );
};

export default TroubleshooterPage;
