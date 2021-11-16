import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';
import * as Table from 'reactabular-table';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';

const requiredFormatter = required => {
  if (required) {
    return (
      <div style={styles.requiredCheck}>
        <FontAwesome icon="check" />
      </div>
    );
  } else {
    return null;
  }
};

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

export default function ParametersTable({parameters}) {
  const columns = [
    {
      property: 'name',
      header: {
        label: i18n.name(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%'
          }
        }
      },
      cell: {
        props: {style: tableLayoutStyles.cell}
      }
    },
    {
      property: 'type',
      header: {
        label: i18n.type(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%'
          }
        }
      },
      cell: {
        props: {style: tableLayoutStyles.cell}
      }
    },
    {
      property: 'required',
      header: {
        label: i18n.requiredQuestion(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%'
          }
        }
      },
      cell: {
        formatters: [requiredFormatter],
        props: {style: tableLayoutStyles.cell}
      }
    },
    {
      property: 'description',
      header: {
        label: i18n.description(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '55%'
          }
        }
      },
      cell: {
        formatters: [descriptionFormatter],
        props: {style: tableLayoutStyles.cell}
      }
    }
  ];

  return (
    <Table.Provider
      style={{...tableLayoutStyles.table, ...styles.table}}
      columns={columns}
    >
      <Table.Header />

      <Table.Body rows={parameters} rowKey="name" />
    </Table.Provider>
  );
}

ParametersTable.propTypes = {
  parameters: PropTypes.arrayOf(PropTypes.object)
};

const styles = {
  headerCell: {
    backgroundColor: color.teal,
    color: color.white
  },
  requiredCheck: {
    textAlign: 'center'
  },
  table: {
    width: '100%'
  }
};
