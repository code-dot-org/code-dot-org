import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import msg from '@cdo/locale';

import {hidePreview} from '../redux/data';

import DataTable from './DataTable';
import {getDatasetInfo} from './dataUtils';
import TableDescription from './TableDescription';

class PreviewModal extends React.Component {
  static propTypes = {
    importTable: PropTypes.func.isRequired,
    // Provided via Redux
    libraryManifest: PropTypes.object.isRequired,
    isPreviewOpen: PropTypes.bool.isRequired,
    tableName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired,
  };

  importTable(datasetInfo) {
    this.props.importTable(datasetInfo);
    this.props.onClose();
  }

  render() {
    const {isPreviewOpen, tableName, libraryManifest, onClose} = this.props;

    if (!isPreviewOpen) {
      return null;
    }
    const datasetInfo = getDatasetInfo(tableName, libraryManifest.tables);
    return (
      <BaseDialog isOpen handleClose={onClose} fullWidth fullHeight>
        <h1>{tableName}</h1>
        <TableDescription
          tableName={tableName}
          libraryTables={libraryManifest.tables}
        />
        <div style={{overflow: 'scroll', maxHeight: '70%'}}>
          <DataTable readOnly rowsPerPage={100} />
        </div>
        <button
          id="ui-test-import-table-btn"
          type="button"
          onClick={() => this.importTable(datasetInfo)}
        >
          {msg.import()}
        </button>
      </BaseDialog>
    );
  }
}

export default connect(
  state => ({
    isPreviewOpen: state.data.isPreviewOpen,
    tableName: state.data.tableName || '',
    libraryManifest: state.data.libraryManifest || {},
  }),
  dispatch => ({
    onClose() {
      dispatch(hidePreview());
    },
  })
)(PreviewModal);
