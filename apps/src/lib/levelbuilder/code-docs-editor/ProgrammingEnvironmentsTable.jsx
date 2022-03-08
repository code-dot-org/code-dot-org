import React from 'react';
import PropTypes from 'prop-types';
import * as Table from 'reactabular-table';
import {TextLink} from '@dsco_/link';

const actionsCellFormatter = (actions, {rowData}) => {
  return (
    <div style={styles.actionsColumn}>
      <TextLink icon={<i className="fa fa-edit" />} href={rowData.editPath} />
      <TextLink
        icon={<i className="fa fa-trash" />}
        href={rowData.destroyPath}
      />
    </div>
  );
};

export default function ProgrammingEnvironmentsTable({
  programmingEnvironments,
  hidden
}) {
  const getColumns = () => {
    return [
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          formatters: [actionsCellFormatter]
        }
      },

      {
        property: 'title',
        header: {
          label: 'Title'
        }
      }
    ];
  };
  if (hidden) {
    return null;
  }
  return (
    <Table.Provider columns={getColumns()} style={{width: '100%'}}>
      <Table.Header />
      <Table.Body rows={programmingEnvironments} rowKey="name" />
    </Table.Provider>
  );
}

ProgrammingEnvironmentsTable.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object),
  hidden: PropTypes.bool
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  }
};
