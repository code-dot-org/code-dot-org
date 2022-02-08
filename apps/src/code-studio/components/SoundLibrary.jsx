import PropTypes from 'prop-types';
import React from 'react';
import SoundList from './SoundList';
import SoundCategory from './SoundCategory';
import * as color from '../../util/color';
import Sounds from '../../Sounds';
import SearchBar from '@cdo/apps/templates/SearchBar';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import i18n from '@cdo/locale';

const SOUND_CATEGORIES = {
  accent: 'Accent',
  achievements: 'Achievements',
  alerts: 'Alerts',
  animals: 'Animals',
  app: 'App',
  background: 'Background',
  bell: 'Bell',
  board_games: 'Board games',
  collect: 'Collect',
  digital: 'Digital',
  explosion: 'Explosion',
  female_voiceover: 'Female voiceovers',
  hits: 'Hits',
  human: 'Human',
  instrumental: 'Instrumental',
  jump: 'Jump',
  loops: 'Loops',
  male_voiceover: 'Male voiceovers',
  movement: 'Movement',
  music: 'Music',
  nature: 'Nature',
  notifications: 'Notifications',
  objects: 'Objects',
  points: 'Points',
  poof: 'Poof',
  pop: 'Pop',
  projectile: 'Projectile',
  puzzle: 'Puzzle',
  retro: 'Retro',
  slide: 'Slide',
  swing: 'Swing',
  swish: 'Swish',
  tap: 'Tap',
  transition: 'Transition',
  whoosh: 'Whoosh',
  all: 'All'
};

/**
 * A component for managing sounds, searching sounds, and categories of sounds.
 */
export default class SoundLibrary extends React.Component {
  static propTypes = {
    alignment: PropTypes.string,
    assetChosen: PropTypes.func.isRequired
  };

  state = {
    search: '',
    category: '',
    selectedSound: {}
  };

  UNSAFE_componentWillMount() {
    this.sounds = Sounds.getSingleton();
  }

  search = e => {
    this.setState({
      search: e.target.value
    });
  };

  selectSound = sound => {
    this.setState({
      selectedSound: sound
    });
  };

  onClickChoose = () => {
    firehoseClient.putRecord(
      {
        study: 'sound-dialog-2',
        study_group: 'library-tab',
        event: 'choose-library-sound',
        data_json: this.state.selectedSound.sourceUrl
      },
      {includeUserId: true}
    );
    this.sounds.stopAllAudio();
    this.props.assetChosen(this.state.selectedSound.sourceUrl);
  };

  onCategoryChange = category => {
    this.setState({category});
  };

  clearCategories = () => {
    this.setState({
      category: '',
      search: ''
    });
    this.sounds.stopAllAudio();
  };

  animationCategoriesRendering() {
    return Object.keys(SOUND_CATEGORIES).map(category => (
      <SoundCategory
        key={SOUND_CATEGORIES[category]}
        displayName={SOUND_CATEGORIES[category]}
        category={category}
        onSelect={this.onCategoryChange}
      />
    ));
  }

  render() {
    return (
      <div>
        <div style={styles.breadcrumbs}>
          <span onClick={this.clearCategories} style={styles.allCategoriesText}>
            All categories
          </span>
          {this.state.category !== '' && (
            <span style={styles.categoryText}>
              {'> ' + SOUND_CATEGORIES[this.state.category]}
            </span>
          )}
        </div>
        <div style={styles.searchBarContainer}>
          <SearchBar
            onChange={this.search}
            placeholderText={i18n.soundSearchPlaceholder()}
          />
        </div>
        {this.state.category === '' && this.state.search === '' && (
          <div style={styles.categoryArea}>
            {this.animationCategoriesRendering()}
          </div>
        )}
        {(this.state.category !== '' || this.state.search !== '') && (
          <div>
            <SoundList
              assetChosen={this.selectSound}
              search={this.state.search}
              category={this.state.category}
              selectedSound={this.state.selectedSound}
              soundsRegistry={this.sounds}
            />
            <button
              type="button"
              className={'primary'}
              onClick={this.onClickChoose}
              style={styles.button}
            >
              Choose
            </button>
          </div>
        )}
      </div>
    );
  }
}

const styles = {
  button: {
    float: 'right',
    margin: '20px 0px'
  },
  categoryArea: {
    float: 'left',
    marginBottom: 20,
    overflowY: 'scroll',
    height: 320
  },
  allCategoriesText: {
    fontSize: 16,
    color: color.purple,
    font: 'Gotham 5r',
    paddingRight: 5,
    cursor: 'pointer'
  },
  breadcrumbs: {
    float: 'left',
    marginTop: 16
  },
  categoryText: {
    fontSize: 14
  },
  searchBarContainer: {
    width: '300px',
    float: 'right',
    marginBottom: 10
  }
};
