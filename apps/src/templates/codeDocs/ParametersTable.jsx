import PropTypes from 'prop-types';
import React from 'react';
import * as Table from 'reactabular-table';

import FontAwesome from '@cdo/apps/legacySharedComponents/FontAwesome';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import {tableLayoutStyles} from '@cdo/apps/templates/tables/tableConstants';
import color from '@cdo/apps/util/color';
import i18n from '@cdo/locale';

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

export default function ParametersTable({
  parameters,
  programmingEnvironmentLanguage,
  isSmallWindow,
}) {
  const descriptionFormatter = description => {
    if (description) {
      const padding = isSmallWindow ? '0px 0px 0px 5px' : 10;
      return (
        <div style={{padding: padding}}>
          <EnhancedSafeMarkdown markdown={description} />
        </div>
      );
    } else {
      return null;
    }
  };

  const hideRequiredColumn = programmingEnvironmentLanguage === 'java';
  let cellStyle = tableLayoutStyles.cell;
  if (isSmallWindow) {
    cellStyle = {...cellStyle, ...styles.smallCell};
  }
  const columns = [
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
        props: {style: cellStyle},
      },
    },
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
        props: {style: cellStyle},
      },
    },
    {
      property: 'required',
      header: {
        label: i18n.requiredQuestion(),
        props: {
          style: {
            ...tableLayoutStyles.headerCell,
            ...styles.headerCell,
            width: '15%',
            ...(hideRequiredColumn && {display: 'none'}),
          },
        },
      },
      cell: {
        formatters: [requiredFormatter],
        props: {
          style: {
            ...cellStyle,
            ...(hideRequiredColumn && {display: 'none'}),
          },
        },
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
        props: {style: cellStyle},
      },
    },
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
  parameters: PropTypes.arrayOf(PropTypes.object),
  programmingEnvironmentLanguage: PropTypes.string,
  isSmallWindow: PropTypes.bool,
};

const styles = {
  headerCell: {
    backgroundColor: color.teal,
    color: color.white,
  },
  requiredCheck: {
    textAlign: 'center',
  },
  table: {
    width: '100%',
  },
  smallCell: {
    padding: 5,
    fontSize: 13,
  },
};
