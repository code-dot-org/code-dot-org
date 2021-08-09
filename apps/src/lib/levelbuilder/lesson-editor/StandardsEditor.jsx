import PropTypes from 'prop-types';
import React, {Component} from 'react';
import * as Table from 'reactabular-table';
import {lessonEditorTableStyles} from './TableConstants';
import color from '@cdo/apps/util/color';
import Dialog from '@cdo/apps/templates/Dialog';
import {connect} from 'react-redux';
import {
  addStandard,
  removeStandard
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import {standardShape, frameworkShape} from '@cdo/apps/lib/levelbuilder/shapes';
import SearchBox from '@cdo/apps/lib/levelbuilder/lesson-editor/SearchBox';

class StandardsEditor extends Component {
  static propTypes = {
    standardType: PropTypes.string.isRequired,
    standards: PropTypes.arrayOf(standardShape).isRequired,
    frameworks: PropTypes.arrayOf(frameworkShape).isRequired,

    // provided by redux
    addStandard: PropTypes.func.isRequired,
    removeStandard: PropTypes.func.isRequired
  };

  state = {
    standardToRemove: null,
    confirmRemovalDialogOpen: false,
    frameworkShortcode: null
  };

  actionsCellFormatter = (actions, {rowData}) => {
    return (
      <div style={styles.actionsColumn}>
        <div
          style={styles.remove}
          className="unit-test-remove-standard"
          onMouseDown={() => this.handleRemoveStandardDialogOpen(rowData)}
        >
          <i className="fa fa-trash" />
        </div>
      </div>
    );
  };

  getColumns() {
    const columns = [
      {
        property: 'frameworkName',
        header: {
          label: 'Framework',
          props: {
            style: {width: '20%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'shortcode',
        header: {
          label: 'Shortcode',
          props: {
            style: {width: '10%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'description',
        header: {
          label: 'Description',
          props: {
            style: {width: '63%'}
          }
        },
        cell: {
          props: {
            style: {
              ...lessonEditorTableStyles.cell
            }
          }
        }
      },
      {
        property: 'actions',
        header: {
          label: 'Actions',
          props: {
            style: {width: '7%'}
          }
        },
        cell: {
          formatters: [this.actionsCellFormatter],
          props: {
            style: {
              ...lessonEditorTableStyles.actionsCell
            }
          }
        }
      }
    ];
    return columns;
  }

  handleRemoveStandardDialogOpen = standard => {
    this.setState({standardToRemove: standard, confirmRemovalDialogOpen: true});
  };

  handleRemoveStandardDialogClose = () => {
    this.setState({standardToRemove: null, confirmRemovalDialogOpen: false});
  };

  removeStandard = () => {
    this.props.removeStandard(
      this.props.standardType,
      this.state.standardToRemove
    );
    this.handleRemoveStandardDialogClose();
  };

  handleSelectFramework = e => {
    const frameworkShortcode = e.target.value;
    this.setState({frameworkShortcode});
  };

  constructStandardOption = standard => ({
    value: standard.shortcode,
    label: `${standard.frameworkShortcode.toUpperCase()} - ${
      standard.shortcode
    } - ${standard.description}`,
    standard: standard
  });

  constructSearchOptions = json => {
    const existingShortcodes = this.props.standards.map(
      standard => standard.shortcode
    );
    const standards = json
      // Filter any that are already added to lesson
      .filter(standard => !existingShortcodes.includes(standard.shortcode))
      .map(standard => this.constructStandardOption(standard));
    return {options: standards};
  };

  onSearchSelect = option => {
    this.props.addStandard(this.props.standardType, option.standard);
  };

  render() {
    const columns = this.getColumns();
    const standardShortcodes = this.props.standards
      .map(standard => standard.shortcode)
      .join(',');
    const searchBoxKey = `${
      this.state.frameworkShortcode
    },${standardShortcodes}`;
    return (
      <div>
        <label>
          <strong>Filter by framework</strong>
        </label>
        <select onChange={this.handleSelectFramework} style={styles.select}>
          <option value="">(none)</option>
          {this.props.frameworks.map(framework => (
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
          onSearchSelect={this.onSearchSelect}
          searchUrl={'standards/search'}
          constructOptions={this.constructSearchOptions}
          additionalQueryParams={{
            framework: this.state.frameworkShortcode
          }}
        />
        <br />
        <Table.Provider columns={columns}>
          <Table.Header />
          <Table.Body rows={this.props.standards} rowKey="shortcode" />
        </Table.Provider>
        {this.state.confirmRemovalDialogOpen && (
          <Dialog
            body={`Are you sure you want to remove standard "${
              this.state.standardToRemove.shortcode
            }" from this lesson?`}
            cancelText="Cancel"
            confirmText="Delete"
            confirmType="danger"
            isOpen={this.state.confirmRemovalDialogOpen}
            handleClose={this.handleRemoveStandardDialogClose}
            onCancel={this.handleRemoveStandardDialogClose}
            onConfirm={this.removeStandard}
          />
        )}
      </div>
    );
  }
}

const styles = {
  actionsColumn: {
    display: 'flex',
    justifyContent: 'space-evenly',
    backgroundColor: 'white'
  },
  remove: {
    fontSize: 14,
    color: 'white',
    background: color.dark_red,
    cursor: 'pointer',
    textAlign: 'center',
    width: 50,
    lineHeight: '30px'
  },
  select: {
    width: 400
  }
};

export const UnconnectedStandardsEditor = StandardsEditor;

export default connect(
  state => ({}),
  {
    addStandard,
    removeStandard
  }
)(StandardsEditor);
