import React from 'react';

import Cell from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/Cell';
import Header from '@cdo/apps/templates/manageStudents/Table/UsStateColumn/Header';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import i18n from '@cdo/locale';

import {RowData} from './interface';

const UsStateColumn = () => {
  const headerFormatter = () => <Header />;

  const cellFormatter = (usState: string, {rowData}: {rowData: RowData}) => (
    <Cell
      value={usState}
      id={rowData.id}
      isEditing={rowData.isEditing}
      editedValue={rowData.isEditing ? rowData.editingData.usState : ''}
    />
  );

  return {
    property: 'usState',
    header: {
      formatters: [headerFormatter],
      label: i18n.usState(),
      props: {
        style: {
          ...tableLayoutStyles.cell,
          ...tableLayoutStyles.headerCell,
        },
      },
    },
    cell: {
      formatters: [cellFormatter],
      props: {
        style: {
          ...tableLayoutStyles.cell,
        },
      },
    },
  };
};

export default UsStateColumn;
