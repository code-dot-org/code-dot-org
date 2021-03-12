import PropTypes from 'prop-types';
import React from 'react';

import BaseDialog from '@cdo/apps/templates/BaseDialog';

const defaultStyle = {
  paddingLeft: 20,
  paddingRight: 20,
  paddingBottom: 20,
  fontFamily: '"Gotham 4r", sans-serif, sans-serif'
};

export default class LessonEditorDialog extends React.Component {
  static propTypes = {
    children: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.node),
      PropTypes.node
    ]).isRequired,
    handleClose: PropTypes.func.isRequired,
    isOpen: PropTypes.bool.isRequired,
    style: PropTypes.object
  };

  render() {
    const customStyle = this.props.style || {};
    const style = {
      ...defaultStyle,
      ...customStyle
    };

    return (
      <BaseDialog
        handleClose={this.props.handleClose}
        isOpen={this.props.isOpen}
        style={style}
        useUpdatedStyles
      >
        {this.props.children}
      </BaseDialog>
    );
  }
}
