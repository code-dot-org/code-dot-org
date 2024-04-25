import PropTypes from 'prop-types';
import React from 'react';
import * as Table from 'reactabular-table';

import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

const descriptionFormatter = description => {
  if (description) {
    return (
      <div style={{padding: 10}}>
        <EnhancedSafeMarkdown markdown={description} />
      </div>
    );
  } else {
    return null;
  }
};

export default function FieldsTable({fields}) {
  const columns = [
    {
      property: 'type',
      header: {
        label: i18n.type(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%',
          },
        },
      },
      cell: {
        props: {style: tableLayoutStyles.cell},
      },
    },
    {
      property: 'name',
      header: {
        label: i18n.name(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%',
          },
        },
      },
      cell: {
        props: {style: tableLayoutStyles.cell},
      },
    },
    {
      property: 'description',
      header: {
        label: i18n.description(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '55%',
          },
        },
      },
      cell: {
        formatters: [descriptionFormatter],
        props: {style: tableLayoutStyles.cell},
      },
    },
  ];

  return (
    <Table.Provider
      style={{...tableLayoutStyles.table, ...styles.table}}
      columns={columns}
    >
      <Table.Header />

      <Table.Body rows={fields} rowKey="name" />
    </Table.Provider>
  );
}

FieldsTable.propTypes = {
  fields: PropTypes.arrayOf(PropTypes.object),
};

const styles = {
  headerCell: {
    backgroundColor: color.teal,
    color: color.white,
  },
  table: {
    width: '100%',
  },
};
