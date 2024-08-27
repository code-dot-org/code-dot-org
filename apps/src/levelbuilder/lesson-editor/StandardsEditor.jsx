import PropTypes from 'prop-types';
import React, {useState} from 'react';
import {connect} from 'react-redux';
import * as Table from 'reactabular-table';

import Dialog from '@cdo/apps/legacySharedComponents/Dialog';
import SearchBox from '@cdo/apps/levelbuilder/lesson-editor/SearchBox';
import {
  addStandard,
  removeStandard,
} from '@cdo/apps/levelbuilder/lesson-editor/standardsEditorRedux';
import {standardShape, frameworkShape} from '@cdo/apps/levelbuilder/shapes';
import color from '@cdo/apps/util/color';

import {lessonEditorTableStyles} from './TableConstants';

function StandardsEditor(props) {
  const [standardToRemove, setStandardToRemove] = useState(null);
  const [confirmRemovalDialogOpen, setConfirmRemovalDialogOpen] =
    useState(false);
  const [frameworkShortcode, setFrameworkShortcode] = useState(null);

  const actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.remove}
          className="unit-test-remove-standard"
          onMouseDown={() => handleRemoveStandardDialogOpen(rowData)}
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  const getColumns = () => {
    const columns = [
      {
        property: 'frameworkName',
        header: {
          label: 'Framework',
          props: {
            style: {width: '20%'},
          },
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell,
            },
          },
        },
      },
      {
        property: 'shortcode',
        header: {
          label: 'Shortcode',
          props: {
            style: {width: '10%'},
          },
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell,
            },
          },
        },
      },
      {
        property: 'description',
        header: {
          label: 'Description',
          props: {
            style: {width: '63%'},
          },
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell,
            },
          },
        },
      },
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '7%'},
          },
        },
        cell: {
          formatters: [actionsCellFormatter],
          props: {
            style: {
              ...lessonEditorTableStyles.actionsCell,
            },
          },
        },
      },
    ];
    return columns;
  };

  const handleRemoveStandardDialogOpen = standard => {
    setStandardToRemove(standard);
    setConfirmRemovalDialogOpen(true);
  };

  const handleRemoveStandardDialogClose = () => {
    setStandardToRemove(null);
    setConfirmRemovalDialogOpen(false);
  };

  const handleConfirmRemoveStandard = () => {
    props.removeStandard(props.standardType, standardToRemove);
    handleRemoveStandardDialogClose();
  };

  const handleSelectFramework = e => {
    const frameworkShortcode = e.target.value;
    setFrameworkShortcode(frameworkShortcode);
  };

  const constructStandardOption = standard => ({
    value: standard.shortcode,
    label: `${standard.frameworkShortcode.toUpperCase()} - ${
      standard.shortcode
    } - ${standard.description}`,
    standard: standard,
  });

  const constructSearchOptions = json => {
    const existingShortcodes = props.standards.map(
      standard => standard.shortcode
    );
    const standards = json
      // Filter any that are already added to lesson
      .filter(standard => !existingShortcodes.includes(standard.shortcode))
      .map(standard => constructStandardOption(standard));
    return {options: standards};
  };

  const onSearchSelect = option => {
    props.addStandard(props.standardType, option.standard);
  };

  const columns = getColumns();
  const standardShortcodes = props.standards
    .map(standard => standard.shortcode)
    .join(',');
  const searchBoxKey = `${frameworkShortcode},${standardShortcodes}`;
  return (
    <div>
      <label htmlFor="framework">
        <strong>Filter by framework</strong>
      </label>
      <select
        onChange={handleSelectFramework}
        style={styles.select}
        id="framework"
      >
        <option value="">(none)</option>
        {props.frameworks.map(framework => (
          <option key={framework.shortcode} value={framework.shortcode}>
            {framework.name}
          </option>
        ))}
      </select>
      <label>
        <strong>Select a Standard to add</strong>
      </label>
      <SearchBox
        // Specify a key in order to force this component to remount when
        // framework changes. Otherwise, it may return stale results when
        // a query is repeated after changing the framework.
        key={searchBoxKey}
        onSearchSelect={onSearchSelect}
        searchUrl={'standards/search'}
        constructOptions={constructSearchOptions}
        additionalQueryParams={{
          framework: frameworkShortcode,
        }}
      />
      <br />
      <Table.Provider columns={columns}>
        <Table.Header />
        <Table.Body rows={props.standards} rowKey="shortcode" />
      </Table.Provider>
      {confirmRemovalDialogOpen && (
        <Dialog
          body={`Are you sure you want to remove standard "${standardToRemove.shortcode}" from this lesson?`}
          cancelText="Cancel"
          confirmText="Delete"
          confirmType="danger"
          isOpen={confirmRemovalDialogOpen}
          handleClose={handleRemoveStandardDialogClose}
          onCancel={handleRemoveStandardDialogClose}
          onConfirm={handleConfirmRemoveStandard}
        />
      )}
    </div>
  );
}

StandardsEditor.propTypes = {
  standardType: PropTypes.string.isRequired,
  standards: PropTypes.arrayOf(standardShape).isRequired,
  frameworks: PropTypes.arrayOf(frameworkShape).isRequired,

  // provided by redux
  addStandard: PropTypes.func.isRequired,
  removeStandard: PropTypes.func.isRequired,
};

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white',
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    width: 50,
    lineHeight: '30px',
  },
  select: {
    width: 400,
  },
};

export const UnconnectedStandardsEditor = StandardsEditor;

export default connect(state => ({}), {
  addStandard,
  removeStandard,
})(StandardsEditor);
