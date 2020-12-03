/** @file Vertical scrolling list */
import React from 'react';
import PropTypes from 'prop-types';
import Radium from 'radium';

const staticStyles = {
  root: {
    overflowX: 'hidden',
    overflowY: 'scroll'
  },
  margins: {
    margin: 4
  }
};

/**
 * Component displaying a vertical list of tiles that scrolls if it grows
 * beyond its natural height.
 */
class ScrollableList extends React.Component {
  static propTypes = {
    className: PropTypes.string,
    style: PropTypes.object,
    children: PropTypes.node,
    onScroll: PropTypes.func
  };

  render() {
    return (
      <div
        className={this.props.className}
        style={[staticStyles.root, this.props.style]}
        onScroll={this.props.onScroll}
      >
        <div style={staticStyles.margins}>{this.props.children}</div>
      </div>
    );
  }
}

export default Radium(ScrollableList);
