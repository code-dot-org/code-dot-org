import React, {PropTypes} from 'react';
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
export default class SoundList extends React.Component {
  static propTypes = {
    assetChosen: PropTypes.func.isRequired,
    search: PropTypes.string.isRequired,
    category: PropTypes.string.isRequired,
    selectedSound: PropTypes.object.isRequired
  };

  componentWillMount() {
    this.sounds = new Sounds();
  }

  getMatches(searchQuery) {
    // Sound library does not use pagination so give a range from 0 - 400
    const searchedData = searchAssets(searchQuery, this.props.category, soundLibrary, 0, 400);
    return searchedData.results;
  }

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
}
