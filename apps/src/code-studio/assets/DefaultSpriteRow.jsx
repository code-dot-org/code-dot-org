import React from 'react';
import PropTypes from 'prop-types';

export default class DefaultSpriteRow extends React.Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    keyValue: PropTypes.string
  };

  render() {
    return (
      <div>
        <h3>
          {this.props.name} {this.props.keyValue}
        </h3>
      </div>
    );
  }
}
