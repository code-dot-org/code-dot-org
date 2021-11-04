import React from 'react';
import PropTypes from 'prop-types';
import EnhancedSafeMarkdown from '@cdo/apps/templates/EnhancedSafeMarkdown';
import i18n from '@cdo/locale';
import * as Table from 'reactabular-table';
import FontAwesome from '@cdo/apps/templates/FontAwesome';
import color from '@cdo/apps/util/color';

const requiredFormatter = required => {
  return <div>{required && <FontAwesome icon="check" />}</div>;
};

const descriptionFormatter = description => {
  return (
    <div style={{padding: 10}}>
      <EnhancedSafeMarkdown markdown={description} />
    </div>
  );
};

export default function ParametersTable({parameters}) {
  const columns = [
    {
      property: 'name',
      header: {
        label: i18n.name(),
        props: {
          style: {...styles.headerCell, width: '15%'}
        }
      }
    },
    {
      property: 'type',
      header: {
        label: i18n.type(),
        props: {
          style: {...styles.headerCell, width: '15%'}
        }
      }
    },
    {
      property: 'required',
      header: {
        label: i18n.requiredQuestion(),
        props: {
          style: {...styles.headerCell, width: '15%'}
        }
      },
      cell: {
        formatters: [requiredFormatter]
      }
    },
    {
      property: 'description',
      header: {
        label: i18n.description(),
        props: {
          style: {...styles.headerCell, width: '55%'}
        }
      },
      cell: {
        formatters: [descriptionFormatter]
      }
    }
  ];

  return (
    <Table.Provider className="pure-table pure-table-striped" columns={columns}>
      <Table.Header />

      <Table.Body rows={parameters} rowKey="id" />
    </Table.Provider>
  );
}

ParametersTable.propTypes = {
  parameters: PropTypes.object
};

const styles = {
  headerCell: {
    backgroundColor: color.teal
  }
};
