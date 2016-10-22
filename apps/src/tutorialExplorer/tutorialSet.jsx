/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
  },

  render() {
    return (
      <div
        className="col-80"
        style={{float: 'left'}}
      >
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
