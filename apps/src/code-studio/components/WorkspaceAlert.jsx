import PropTypes from 'prop-types';
import React from 'react';
import Alert from '@cdo/apps/templates/alert';
import $ from 'jquery';

export default class WorkspaceAlert extends React.Component {
  static propTypes = {
    type: PropTypes.oneOf(['error', 'warning', 'notification']).isRequired,
    children: PropTypes.element,
    onClose: PropTypes.func,
    isBlockly: PropTypes.bool,
    isCraft: PropTypes.bool,
    displayBottom: PropTypes.bool
  };

  render() {
    const {displayBottom} = this.props;
    var toolbarWidth;
    if (this.props.isBlockly && this.props.isCraft) {
      // craft has a slightly different way of constructing the toolbox so we need to use
      // the toolbox header's width to get the width of the actual toolbox.
      toolbarWidth = $('#toolbox-header').width();
    } else if (this.props.isBlockly) {
      toolbarWidth = $('.blocklyToolboxDiv').width();
    } else {
      toolbarWidth =
        $('.droplet-palette-element').width() + $('.droplet-gutter').width();
    }

    let style = {
      position: 'absolute',
      right: 0,
      left: toolbarWidth
    };
    if (displayBottom) {
      style.bottom = 0;
    } else {
      style.top = $('#headers').height();
    }

    return (
      <div style={style}>
        <Alert
          onClose={this.props.onClose}
          type={this.props.type}
          sideMargin={displayBottom ? 0 : undefined}
          bottomMargin={displayBottom ? 0 : undefined}
        >
          {this.props.children}
        </Alert>
      </div>
    );
  }
}

// TODO: Unit tests
