import React, {PropTypes} from 'react';
import SoundList from './SoundList';
import SoundCategory from './SoundCategory';
import * as color from "../../util/color";
import Sounds from '../../Sounds';

const SOUND_CATEGORIES = {
  category_animals: 'Animals',
  category_background: 'Background',
  category_board_games: 'Board games',
  category_digital: 'Digital',
  category_female_voiceover: 'Female voiceovers',
  category_instrumental: 'Instrumental',
  category_male_voiceover: 'Male voiceovers',
  category_objects: 'Objects',
  category_all: 'All'
};

const styles = {
  searchArea: {
    float: 'right',
    position: 'relative',
    margin: '10px 0'
  },
  input: {
    width: 300,
    border: '1px solid ' + color.light_gray,
    borderRadius: 4,
    padding: '3px 7px'
  },
  sound: {
    position: 'absolute',
    right: 5,
    top: 5,
    fontSize: 16,
    color: color.light_gray
  },
  button: {
    float: 'right',
    margin: '20px 0px'
  },
  categoryArea: {
    float: 'left',
    marginBottom: 20
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
  }
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

  componentWillMount() {
    this.sounds = Sounds.getSingleton();
  }

  search = (e) => {
    this.setState({
      search: e.target.value
    });
  };

  selectSound = (sound) => {
    this.setState({
      selectedSound: sound
    });
  };

  onClickChoose = () => {
    this.sounds.stopAllAudio();
    this.props.assetChosen(this.state.selectedSound.sourceUrl);
  };

  onCategoryChange = (category) => {
    this.setState({category});
  };

  clearCategories = () => {
    this.setState({
      category: '',
      search: ''
    });
  };

  animationCategoriesRendering() {
    return Object.keys(SOUND_CATEGORIES).map(category =>
      <SoundCategory
        key={SOUND_CATEGORIES[category]}
        displayName={SOUND_CATEGORIES[category]}
        category={category}
        onSelect={this.onCategoryChange}
      />
    );
  }

  render() {
    return (
      <div>
        <div style={styles.breadcrumbs}>
          <span
            onClick={this.clearCategories}
            style={styles.allCategoriesText}
          >
            All categories
          </span>
          {this.state.category !== '' &&
            <span style={styles.categoryText}>{'> ' + SOUND_CATEGORIES[this.state.category]}</span>
          }
        </div>
        <div style={styles.searchArea}>
          <input
            onChange={this.search}
            style={styles.input}
            placeholder={'Search for a sound...'}
          />
          <i className="fa fa-search" style={styles.sound}/>
        </div>
        {(this.state.category === '' && this.state.search === '') &&
          <div style={styles.categoryArea}>
            {this.animationCategoriesRendering()}
          </div>
        }
        {(this.state.category !== '' || this.state.search !== '') &&
          <div>
            <SoundList
              assetChosen={this.selectSound}
              search={this.state.search}
              category={this.state.category}
              selectedSound={this.state.selectedSound}
              soundsRegistry={this.sounds}
            />
            <button
              className={"primary"}
              onClick={this.onClickChoose}
              style={styles.button}
            >
              Choose
            </button>
          </div>
        }
      </div>
    );
  }
}
