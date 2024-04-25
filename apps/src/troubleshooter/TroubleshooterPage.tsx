import React from 'react';
import * as Table from 'reactabular-table';

import supportedBrowsers from '@cdo/apps/generated/supportedBrowsers';

const TroubleshooterPage = () => {
  const columns = [
    {
      property: 'name',
      header: {
        label: 'Name',
      },
    },
    {
      property: 'description',
      header: {
        label: 'Description',
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
      description:
        'See support article for minimum supported browser versions.',
      status: supportedBrowsers.test(navigator.userAgent) ? 'Pass' : 'Fail',
    },
    {
      name: 'Screen Resolution/Viewport Size',
      description: 'Minimum supported is 1024x768',
      status:
        window.outerWidth >= 1024 && window.outerHeight >= 768
          ? 'Pass'
          : 'Fail',
    },
    {
      name: 'Can reach Code.org?',
      status: 'Pending...',
    },
    {
      name: 'Can load captchas?',
      status: 'Pending...',
    },
    {
      name: 'Can connect to YouTube?',
      status: 'Pending...',
    },
    {
      name: 'Can access Code.org hosted videos?',
      status: 'Pending...',
    },
    {
      name: 'Can use Web Lab?',
      status: 'Pending...',
    },
    {
      name: 'Can use App Lab Data sets?',
      status: 'Pending...',
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
