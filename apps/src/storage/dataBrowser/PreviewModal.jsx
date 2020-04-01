import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {hidePreview} from '../redux/data';
import {getDatasetInfo} from './dataUtils';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';
import DataTable from './DataTable';
import msg from '@cdo/locale';

class PreviewModal extends React.Component {
  static propTypes = {
    importTable: PropTypes.func.isRequired,
    // Provided via Redux
    libraryManifest: PropTypes.object.isRequired,
    isPreviewOpen: PropTypes.bool.isRequired,
    tableName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
  };

  importTable(datasetInfo) {
    this.props.importTable(datasetInfo);
    this.props.onClose();
  }

  render() {
    if (!this.props.isPreviewOpen) {
      return null;
    }
    const datasetInfo = getDatasetInfo(
      this.props.tableName,
      this.props.libraryManifest.tables
    );
    return (
      <BaseDialog isOpen handleClose={this.props.onClose} fullWidth fullHeight>
        <h1>{this.props.tableName}</h1>
        <p>
          {datasetInfo.description}{' '}
          {datasetInfo.docUrl && (
            <a href={datasetInfo.docUrl}>{msg.moreInfo()}</a>
          )}
        </p>
        <div style={{overflow: 'scroll', maxHeight: '70%'}}>
          <DataTable readOnly rowsPerPage={100} />
        </div>
        <button type="button" onClick={() => this.importTable(datasetInfo)}>
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
    libraryManifest: state.data.libraryManifest || {}
  }),
  dispatch => ({
    onClose() {
      dispatch(hidePreview());
    }
  })
)(PreviewModal);
