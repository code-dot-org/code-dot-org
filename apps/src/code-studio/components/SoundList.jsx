import React from 'react';
import PropTypes from 'prop-types';
import createReactClass from 'create-react-class';
import SoundListEntry from './SoundListEntry';
import Sounds from '../../Sounds';
import {searchAssets} from '../assets/searchAssets';
import soundLibrary from '../soundLibrary.json';

const styles = {
  root: {
    height: 330,
    overflowY: 'scroll',
    clear: 'both'
  }
};

/**
 * A component for managing sounds from soundLibrary.json.
 */
const SoundList = createReactClass({
  propTypes: {
    assetChosen: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    selectedSound: PropTypes.object.isRequired
  },

  componentWillMount() {
    this.sounds = new Sounds();
  },

  getMatches(searchQuery) {
    // Sound library does not use pagination so give a range from 0 - 400
    const searchedData = searchAssets(searchQuery, this.props.category, soundLibrary, 0, 400);
    return searchedData.results;
  },

  render() {
    const results = this.getMatches(this.props.search);
    const soundEntries = results.map(sound => {
      const isSelected = this.props.selectedSound.name === sound.name ? true : false;
      return (
        <SoundListEntry
          key={sound.name}
          assetChosen={this.props.assetChosen}
          soundMetadata={sound}
          isSelected={isSelected}
          soundsRegistry={this.sounds}
        />
      );
    });

    return (
      <div style={styles.root}>
        {soundEntries.length > 0 ? soundEntries : 'No sounds found'}
      </div>
    );
  }
});
module.exports = SoundList;
