var React = require('react');
var SoundListEntry = require('./SoundListEntry');
var soundLibrary = require('../soundLibrary.json');
import Immutable from 'immutable';

/**
 * A component for managing sounds from soundLibrary.json.
 */
var SoundList = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    search: React.PropTypes.string.isRequired,
    selectedSound: React.PropTypes.object.isRequired
  },

  getMatches: function (searchQuery) {
    let results = searchSounds(searchQuery);
    return results;
  },

  render: function () {
    var styles = {
      root: {
        height: '330px',
        overflowY: 'scroll',
        clear: 'both'
      }
    };

    var results = this.getMatches(this.props.search);
    var soundEntries = results.map(function (sound) {
      var isSelected = this.props.selectedSound.name === sound.name ? true : false;
      return (
        <SoundListEntry
          key={sound.name}
          assetChosen={this.props.assetChosen}
          soundMetadata={sound}
          isSelected={isSelected}
        />
      );
    }.bind(this));

    return (
      <div style={styles.root}>
        {soundEntries.length > 0 ? soundEntries : 'No sounds found'}
      </div>
    );
  }
});
module.exports = SoundList;

/**
 * Given a search query, generate a results list of sound objects that
 * can be displayed and used to add a sound to the project.
 * @param {string} searchQuery - text entered by the user to find a sound
 * @return {Array} - Limited list of sounds
 *         from the library that match the search query.
 */
function searchSounds(searchQuery) {
  // Make sure to generate the search regex in advance, only once.
  // Search is case-insensitive
  // Match any word boundary or underscore followed by the search query.
  // Example: searchQuery "bar"
  //   Will match: "barbell", "foo-bar", "foo_bar" or "foo bar"
  //   Will not match: "foobar", "ubar"
  const searchRegExp = new RegExp('(?:\\b|_)' + searchQuery, 'i');

  // Generate the set of all results associated with all matched aliases
  let resultSet = Object.keys(soundLibrary.aliases)
      .filter(alias => searchRegExp.test(alias))
      .reduce((resultSet, nextAlias) => {
        return resultSet.union(soundLibrary.aliases[nextAlias]);
      }, Immutable.Set());

  const results = resultSet
      .sort()
      .map(result => soundLibrary.metadata[result])
      .toArray();
  return results;
}
