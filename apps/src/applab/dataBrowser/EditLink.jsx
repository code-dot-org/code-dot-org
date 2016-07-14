import Radium from 'radium';
import React from 'react';
import * as dataStyles from './dataStyles';


const EditLink = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    onClick: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <a style={dataStyles.link} href='#' onClick={this.props.onClick}>
        {this.props.name}
      </a>
    );
  }
});

export default Radium(EditLink);
