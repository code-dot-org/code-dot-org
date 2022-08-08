/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */
import ConfirmDeleteButton from './ConfirmDeleteButton';
import ConfirmImportButton from './ConfirmImportButton';
import VisualizerModal from './dataVisualizer/VisualizerModal';
import PropTypes from 'prop-types';
import React from 'react';
import msg from '@cdo/locale';
import * as dataStyles from './dataStyles';
import style from './table-controls.module.scss';

class TableControls extends React.Component {
  static propTypes = {
    clearTable: PropTypes.func.isRequired,
    exportCsv: PropTypes.func.isRequired,
    importCsv: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired
  };

  render() {
    console.log('table controls');
    return (
      <div className={style.container}>
        <div className={style.tableNameWrapper}>
          <span className={style.tableName}>{this.props.tableName}</span>
        </div>{' '}
        <div className={style.buttonWrapper}>
          <VisualizerModal key={this.props.tableName} />

          {!this.props.readOnly && (
            <ConfirmDeleteButton
              body={msg.confirmClearTable()}
              buttonText="Clear table"
              containerStyle={{width: 103, marginLeft: 10}}
              buttonId="clearTableButton"
              onConfirmDelete={this.props.clearTable}
              title="Clear table"
            />
          )}

          {!this.props.readOnly && (
            <ConfirmImportButton
              importCsv={this.props.importCsv}
              containerStyle={{marginLeft: 10}}
            />
          )}

          <button
            type="button"
            onClick={this.props.exportCsv}
            className={style.exportButton}
            style={dataStyles.whiteButton}
          >
            Export to csv
          </button>
        </div>
        {/* help make the "text-align: justify;" trick work */}
        <div style={dataStyles.clearfix} />
      </div>
    );
  }
}

export default TableControls;
