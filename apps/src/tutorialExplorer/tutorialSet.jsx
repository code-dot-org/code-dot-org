/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';
import { getContainerWidth, getItemWidth } from './responsive';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    windowWidth: React.PropTypes.number.isRequired
  },

  render() {
    return (
      <div style={{float: 'left', width: getItemWidth(80, this.props.windowWidth)}}>
        {this.props.tutorials.map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
            windowWidth={this.props.windowWidth}
          />
        ))}
      </div>
    );
  }
});

export default TutorialSet;
