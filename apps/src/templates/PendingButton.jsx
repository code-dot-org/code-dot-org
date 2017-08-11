/** @overview a button which shows a spinner while an operation is pending */

import FontAwesome from './FontAwesome';
import Radium from 'radium';
import React from 'react';

const PendingButton = React.createClass({
  propTypes: {
    id: React.PropTypes.string,
    isPending: React.PropTypes.bool.isRequired,
    onClick: React.PropTypes.func.isRequired,
    pendingStyle: React.PropTypes.any,
    pendingText: React.PropTypes.string.isRequired,
    style: React.PropTypes.any,
    text: React.PropTypes.string.isRequired,
  },

  render() {
    const style = this.props.isPending ?
      [this.props.style, this.props.pendingStyle] :
      this.props.style;
    return (
      <button
        id={this.props.id}
        style={style}
        onClick={!this.props.isPending && this.props.onClick}
      >
        {
          this.props.isPending ?
            <span>
              {this.props.pendingText}&nbsp;
              <FontAwesome icon="spinner" className="fa-spin"/>
            </span> :
            this.props.text
        }
      </button>
    );
  },
});
export default Radium(PendingButton);
