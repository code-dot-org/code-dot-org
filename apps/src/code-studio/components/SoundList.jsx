import React from 'react';
import SoundListEntry from './SoundListEntry';
import Sounds from '../../Sounds';
import {searchAssets} from '../assets/searchAssets';
var soundLibrary = require('../soundLibrary.json');

/**
 * A component for managing sounds from soundLibrary.json.
 */
var SoundList = React.createClass({
  propTypes: {
    assetChosen: React.PropTypes.func.isRequired,
    search: React.PropTypes.string.isRequired,
    category: React.PropTypes.string.isRequired,
    selectedSound: React.PropTypes.object.isRequired
  },

  componentWillMount: function () {
    this.sounds = new Sounds();
  },

  getMatches: function (searchQuery) {
    // Sound library does not use pagination so give a range from 0 - 400
    const searchedData = searchAssets(searchQuery, this.props.category, soundLibrary, 0, 400);
    return searchedData.results;
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
          soundsRegistry={this.sounds}
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
