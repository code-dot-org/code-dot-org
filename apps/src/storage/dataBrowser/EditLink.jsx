import Radium from 'radium';
import React from 'react';
import PropTypes from 'prop-types';
import * as dataStyles from './dataStyles';


const EditLink = React.createClass({
  propTypes: {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  },

  render() {
    return (
      <a style={dataStyles.link} onClick={this.props.onClick}>
        {this.props.name}
      </a>
    );
  }
});

export default Radium(EditLink);
