import React from 'react';
import SoundList from './SoundList';
import SoundCategory from './SoundCategory';
import * as color from "../../util/color";

const SOUND_CATEGORIES = {
  'category_digital': 'Digital',
  'category_gameplay': 'Game play',
  'category_jingles': 'Jingles',
  'category_female_voiceover': 'Female voiceovers',
  'category_male_voiceover': 'Male voiceovers',
  'category_objects': 'Objects',
  'category_UI': 'User interfaces',
  'category_all': 'All'
};

/**
 * A component for managing sounds, searching sounds, and categories of sounds.
 */
var SoundLibrary = React.createClass({
  propTypes: {
    alignment: React.PropTypes.string,
    assetChosen: React.PropTypes.func.isRequired
  },

  getInitialState: function () {
    return {search: '', category: '', selectedSound: {}};
  },

  search: function (e) {
    this.setState({
      search: e.target.value.toLowerCase().replace(/[^-a-z0-9]/g, '')
    });
  },

  selectSound: function (sound) {
    this.setState({
      selectedSound: sound
    });
  },

  onClickChoose: function () {
    this.props.assetChosen(this.state.selectedSound.sourceUrl);
  },

  onCategoryChange: function (category) {
    this.setState({category: category});
  },

  clearCategories: function () {
    this.setState({category: '', search: ''});
  },

  animationCategoriesRendering: function () {
    return Object.keys(SOUND_CATEGORIES).map(category =>
      <SoundCategory
        key={SOUND_CATEGORIES[category]}
        displayName={SOUND_CATEGORIES[category]}
        category={category}
        onSelect={this.onCategoryChange}
      />
    );
  },

  render: function () {
    var styles = {
      searchArea: {
        float: this.props.alignment || 'right',
        position: 'relative',
        margin: '10px 0'
      },
      input: {
        width: '300px',
        border: '1px solid #999',
        borderRadius: '4px',
        padding: '3px 7px'
      },
      sound: {
        position: 'absolute',
        right: '5px',
        top: '5px',
        fontSize: '16px',
        color: '#999'
      },
      button: {
        float: 'right',
        margin: '20px 0px'
      },
      categoryArea: {
        float: 'left',
        marginBottom: '20px'
      },
      allCategoriesText: {
        fontSize: '16px',
        color: color.purple,
        font: 'Gotham 5r',
        paddingRight: '5px',
        cursor: 'pointer'
      },
      breadcrumbs: {
        float: 'left',
        marginTop: '16px'
      },
      categoryText: {
        fontSize: '14px'
      }
    };

    return (
      <div>
        <div style={styles.breadcrumbs}>
          <span onClick={this.clearCategories} style={styles.allCategoriesText}>All categories</span>
          {this.state.category !== '' && <span style={styles.categoryText}>{'>> ' + SOUND_CATEGORIES[this.state.category]}</span>}
        </div>
        <div style={styles.searchArea}>
          <input
            onChange={this.search}
            style={styles.input}
            placeholder={'Search for a sound...'}
          />
          <i className="fa fa-search" style={styles.sound}/>
        </div>
        {this.state.category === '' &&
          <div style={styles.categoryArea}>
            {this.animationCategoriesRendering()}
          </div>
        }
        {this.state.category !== '' &&
          <div>
            <SoundList
              assetChosen={this.selectSound}
              search={this.state.search}
              category={this.state.category}
              selectedSound={this.state.selectedSound}
            />
            <button className={"primary"} onClick={this.onClickChoose} style={styles.button}>{'Choose'}</button>
          </div>
        }
      </div>
    );
  }
});
module.exports = SoundLibrary;
