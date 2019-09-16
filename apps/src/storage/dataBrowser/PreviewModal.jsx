import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';
import {hidePreview} from '../redux/data';
import BaseDialog from '@cdo/apps/templates/BaseDialog.jsx';

class PreviewModal extends React.Component {
  static propTypes = {
    // Provided via Redux
    isPreviewOpen: PropTypes.bool.isRequired,
    tableName: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
  };

  render() {
    if (!this.props.isPreviewOpen) {
      return null;
    }
    return (
      <BaseDialog isOpen handleClose={this.props.onClose} fullWidth>
        <h1>{this.props.tableName}</h1>
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
