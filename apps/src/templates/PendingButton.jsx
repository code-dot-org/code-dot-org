/** @overview a button which shows a spinner while an operation is pending */

import FontAwesome from './FontAwesome';
import React from 'react';

const PendingButton = React.createClass({
  propTypes: {
    defaultText: React.PropTypes.string.isRequired,
    isPending: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
    pendingText: React.PropTypes.string.isRequired,
    style: React.PropTypes.any,
  },

  render() {
    return (
      <button
        style={this.props.style}
        onClick={!this.props.isPending && this.props.onClick}
      >
        {
          this.props.isPending ?
            <span>
              {this.props.pendingText}&nbsp;
              <FontAwesome icon="spinner" className="fa-spin"/>
            </span> :
            this.props.defaultText
        }
      </button>
    );
  },
});
export default PendingButton;
