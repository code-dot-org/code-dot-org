/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    localeEnglish: React.PropTypes.bool.isRequired
  },

  render() {
    return (
      <div style={{overflow: "hidden"}}>
        {this.props.tutorials.map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
            localeEnglish={this.props.localeEnglish}
          />
        ))}
      </div>
    );
  }
});

export default TutorialSet;
