/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import Tutorial from './tutorial';
import shapes from './shapes';
import i18n from './locale';

const styles = {
  tutorialSetNoTutorials: {
    backgroundColor: "#d6d6d6",
    padding: 20,
    margin: 60,
    whiteSpace: "pre-wrap"
  }
};

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    localeEnglish: React.PropTypes.bool.isRequired,
    disabledTutorials: React.PropTypes.arrayOf(React.PropTypes.string).isRequired
  },

  render() {
    return (
      <div>
        {this.props.tutorials.length > 0 && this.props.tutorials.map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
            localeEnglish={this.props.localeEnglish}
            disabledTutorial={this.props.disabledTutorials.indexOf(item.short_code) !== -1}
          />
        ))}
        {this.props.tutorials.length === 0 && (
          <div style={styles.tutorialSetNoTutorials}>
            {i18n.tutorialSetNoTutorials()}
          </div>
        )}
      </div>
    );
  }
});

export default TutorialSet;
