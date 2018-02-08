/** @overview a button which shows a spinner while an operation is pending */

import FontAwesome from './FontAwesome';
import Radium from 'radium';
import React, {PropTypes} from 'react';

const PendingButton = React.createClass({
  propTypes: {
    className: PropTypes.string,
    id: PropTypes.string,
    isPending: PropTypes.bool.isRequired,
    onClick: PropTypes.func.isRequired,
    pendingStyle: PropTypes.any,
    pendingText: PropTypes.string.isRequired,
    style: PropTypes.any,
    text: PropTypes.string.isRequired,
  },

  render() {
    const style = this.props.isPending ?
      [this.props.style, this.props.pendingStyle] :
      this.props.style;
    return (
      <button
        id={this.props.id}
        style={style}
        className={this.props.className}
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
