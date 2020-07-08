import PropTypes from 'prop-types';
import React from 'react';
import Alert from '@cdo/apps/templates/alert';
import $ from 'jquery';

const styles = {
  alertContainer: {
    position: 'absolute',
    right: 0
  }
};

export default class WorkspaceAlert extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'notification']).isRequired,
    children: PropTypes.element.isRequired,
    onClose: PropTypes.func.isRequired,
    isBlockly: PropTypes.bool,
    isCraft: PropTypes.bool,
    displayBottom: PropTypes.bool
  };

  render() {
    const {
      displayBottom,
      isBlockly,
      isCraft,
      onClose,
      type,
      children
    } = this.props;
    var toolbarWidth;
    if (isBlockly && isCraft) {
      // craft has a slightly different way of constructing the toolbox so we need to use
      // the toolbox header's width to get the width of the actual toolbox.
      toolbarWidth = $('#toolbox-header').width();
    } else if (isBlockly) {
      toolbarWidth = $('.blocklyToolboxDiv').width();
    } else {
      toolbarWidth =
        $('.droplet-palette-element').width() + $('.droplet-gutter').width();
    }

    const position = displayBottom
      ? {bottom: 0, left: toolbarWidth}
      : {top: $('#headers').height(), left: toolbarWidth};

    return (
      <div
        style={{...styles.alertContainer, ...position}}
        onClick={displayBottom ? onClose : undefined}
      >
        <Alert
          onClose={onClose}
          type={type}
          sideMargin={displayBottom ? 0 : undefined}
          bottomMargin={displayBottom ? 0 : undefined}
        >
          {children}
        </Alert>
      </div>
    );
  }
}
