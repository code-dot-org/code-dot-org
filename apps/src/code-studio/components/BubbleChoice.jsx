import React from 'react';
import PropTypes from 'prop-types';

export default class BubbleChoice extends React.Component {
  static propTypes = {
    level: PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      // TODO: create shape for sublevels
      sublevels: PropTypes.array
    })
  };

  render() {
    return <div>Bubble Choice placeholder</div>;
  }
}
