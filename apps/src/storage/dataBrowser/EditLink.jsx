import PropTypes from 'prop-types';
import React from 'react';
import * as dataStyles from './dataStyles';

class EditLink extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  };

  render() {
    return (
      <a style={dataStyles.link} onClick={this.props.onClick}>
        {this.props.name}
      </a>
    );
  }
}

export default EditLink;
