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
  programmingEnvironments
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
  return (
    <Table.Provider columns={getColumns()} style={{width: '100%'}}>
      <Table.Header />
      <Table.Body rows={programmingEnvironments} rowKey="id" />
    </Table.Provider>
  );
}

ProgrammingEnvironmentsTable.propTypes = {
  programmingEnvironments: PropTypes.arrayOf(PropTypes.object)
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'flex-start',
    backgroundColor: 'white'
  }
};
