import $ from 'jquery';
import PropTypes from 'prop-types';
import React from 'react';

import Alert from '@cdo/apps/templates/alert';

export default class WorkspaceAlert extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'notification']).isRequired,
    children: PropTypes.element.isRequired,
    onClose: PropTypes.func.isRequired,
    isBlockly: PropTypes.bool,
    displayBottom: PropTypes.bool,
  };

  render() {
    const {displayBottom, isBlockly, onClose, type, children} = this.props;
    var toolbarWidth;
    if (isBlockly) {
      // use the toolbox header's width to get the width of the actual toolbox.
      toolbarWidth = $('#toolbox-header').width();
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

const styles = {
  alertContainer: {
    position: 'absolute',
    right: 0,
  },
};
