/* FilterGroupContainer: The container UI for a group of filter choices.
 * The choices themselves should be passed in as children.
 */

import PropTypes from 'prop-types';
import React from 'react';
import {getResponsiveValue} from './responsive';

export default class FilterGroupContainer extends React.Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired
  };

  render() {
    const filterGroupOuterStyle = {
      ...styles.filterGroupOuter,
      width: getResponsiveValue({xs: 100, sm: 50, md: 100})
    };

    return (
      <div style={filterGroupOuterStyle}>
        <div style={styles.filterGroupText}>{this.props.text}</div>
        {this.props.children}
      </div>
    );
  }
}

const styles = {
  filterGroupOuter: {
    float: 'left',
    paddingBottom: 20,
    paddingRight: 40,
    paddingLeft: 10
  },
  filterGroupText: {
    fontFamily: '"Gotham 5r", sans-serif',
    borderBottom: 'solid grey 1px'
  }
};
