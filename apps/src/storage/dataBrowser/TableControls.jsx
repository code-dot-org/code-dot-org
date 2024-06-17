/**
 * @overview Component containing UI controls for modifying the table, including
 * import, export, adding a new column, and deleting the entire table.
 */
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';

import msg from '@cdo/locale';

import ConfirmDeleteButton from './ConfirmDeleteButton';
import ConfirmImportButton from './ConfirmImportButton';
import VisualizerModal from './dataVisualizer/VisualizerModal';

import dataStyles from './data-styles.module.scss';
import style from './table-controls.module.scss';

class TableControls extends React.Component {
  static propTypes = {
    isRtl: PropTypes.bool.isRequired,
    clearTable: PropTypes.func.isRequired,
    exportCsv: PropTypes.func.isRequired,
    importCsv: PropTypes.func.isRequired,
    tableName: PropTypes.string.isRequired,
    readOnly: PropTypes.bool.isRequired,
  };

  render() {
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
              buttonText={msg.clearTable()}
              containerStyle={{width: 103, marginLeft: 10}}
              buttonId="clearTableButton"
              onConfirmDelete={this.props.clearTable}
              title={msg.clearTable()}
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
            className={classNames(
              style.exportButton,
              dataStyles.button,
              dataStyles.buttonWhite,
              this.props.isRtl ? style.exportButtonRtl : {}
            )}
          >
            {msg.exportToCSV()}
          </button>
        </div>
        {/* help make the "text-align: justify;" trick work */}
        <div className={style.clearfix} />
      </div>
    );
  }
}

export default TableControls;
