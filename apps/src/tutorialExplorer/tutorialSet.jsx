/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';
import { getResponsiveValue } from './responsive';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
  },

  render() {
    return (
      <div style={{float: 'left', width: getResponsiveValue({xs: 100, md: 80})}}>
        {this.props.tutorials.map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
          />
        ))}
      </div>
    );
  }
});

export default TutorialSet;
