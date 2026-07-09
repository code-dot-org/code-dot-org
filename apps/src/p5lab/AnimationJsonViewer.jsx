import Modal from '@code-dot-org/component-library/modal';
import PropTypes from 'prop-types';
import React from 'react';
import {connect} from 'react-redux';

import i18n from '@cdo/locale';

import {hideAnimationJson} from './actions';

const style = {
  pre: {
    maxHeight: '75vh',
    overflowY: 'auto',
  },
};

class AnimationJsonViewer extends React.Component {
  static propTypes = {
    isOpen: PropTypes.bool.isRequired,
    content: PropTypes.string,
    handleClose: PropTypes.func.isRequired,
  };

  render() {
    if (!this.props.isOpen) {
      return null;
    }
    return (
      <Modal
        title="Animation JSON"
        onClose={this.props.handleClose}
        closeLabel={i18n.closeDialog()}
        customContent={
          <pre id="dsco-dialog-description" style={style.pre}>
            {this.props.content}
          </pre>
        }
        primaryButtonProps={{
          children: i18n.closeDialog(),
          onClick: this.props.handleClose,
        }}
      />
    );
  }
}
export default connect(
  state => state.animationJsonViewer,
  dispatch => ({
    handleClose: () => dispatch(hideAnimationJson()),
  })
)(AnimationJsonViewer);
