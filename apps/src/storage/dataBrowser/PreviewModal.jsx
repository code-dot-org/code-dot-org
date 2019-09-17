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
    const datasetInfo = getDatasetInfo(this.props.tableName);
    return (
      <BaseDialog isOpen handleClose={this.props.onClose} fullWidth>
        <h1>{this.props.tableName}</h1>
        <p>{datasetInfo.description}</p>
        <DataTable getColumnNames={(records, columns) => columns} />
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
    tableName: state.data.tableName
  }),
  dispatch => ({
    onClose() {
      dispatch(hidePreview());
    }
  })
)(PreviewModal);
