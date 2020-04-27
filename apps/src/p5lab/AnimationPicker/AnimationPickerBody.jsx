/** Body of the animation picker dialog */
import PropTypes from 'prop-types';
import React from 'react';
import Radium from 'radium';
import color from '@cdo/apps/util/color';
import {AnimationCategories} from '../gamelab/constants';
import {CostumeCategories} from '../spritelab/constants';
var msg = require('@cdo/locale');
import animationLibrary from '../gamelab/animationLibrary.json';
import spriteCostumeLibrary from '../spritelab/spriteCostumeLibrary.json';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import SearchBar from '@cdo/apps/templates/SearchBar';
import {searchAssets} from '@cdo/apps/code-studio/assets/searchAssets';
import {connect} from 'react-redux';
import i18n from '@cdo/locale';

const MAX_SEARCH_RESULTS = 40;
const MAX_HEIGHT = 420;

const animationPickerStyles = {
  allAnimations: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif",
    cursor: 'pointer'
  },
  breadCrumbs: {
    margin: '8px 0',
    fontSize: 14,
    display: 'inline-block'
  },
  pagination: {
    float: 'right',
    display: 'inline',
    marginTop: 10
  },
  emptyResults: {
    paddingBottom: 10
  },
  navigation: {
    minHeight: 30
  }
};

class AnimationPickerBody extends React.Component {
  static propTypes = {
    is13Plus: PropTypes.bool,
    onDrawYourOwnClick: PropTypes.func.isRequired,
    onPickLibraryAnimation: PropTypes.func.isRequired,
    onUploadClick: PropTypes.func.isRequired,
    playAnimations: PropTypes.bool.isRequired,
    spriteLab: PropTypes.bool
  };

  constructor(props) {
    super(props);

    const initialState = {
      searchQuery: '',
      categoryQuery: '',
      currentPage: 0,
      libraryManifest: props.spriteLab ? spriteCostumeLibrary : animationLibrary
    };
    const results = this.searchAssets(initialState.currentPage, initialState);
    this.state = {
      ...initialState,
      results
    };
  }

  searchAssets = (page, config = {}) => {
    let {searchQuery, categoryQuery, libraryManifest} = config;

    // Set defaults if any config values are undefined.
    if (searchQuery === undefined) {
      searchQuery = this.state.searchQuery;
    }
    if (categoryQuery === undefined) {
      categoryQuery = this.state.categoryQuery;
    }
    if (libraryManifest === undefined) {
      libraryManifest = this.state.libraryManifest;
    }

    const {results} = searchAssets(
      searchQuery,
      categoryQuery,
      libraryManifest,
      page,
      MAX_SEARCH_RESULTS
    );
    return results;
  };

  handleScroll = event => {
    const scrollWindow = event.target;
    if (
      scrollWindow.scrollTop + MAX_HEIGHT >=
      scrollWindow.scrollHeight * 0.9
    ) {
      const nextPage = this.state.currentPage + 1;
      this.setState({
        results: [...this.state.results, ...this.searchAssets(nextPage)],
        currentPage: nextPage
      });
    }
  };

  onSearchQueryChange = searchQuery => {
    const currentPage = 0;
    const results = this.searchAssets(currentPage, {searchQuery});
    this.setState({searchQuery, currentPage, results});
  };

  onCategoryChange = event => {
    const categoryQuery = event.target.className;
    const currentPage = 0;
    const results = this.searchAssets(currentPage, {categoryQuery});
    this.setState({categoryQuery, currentPage, results});
  };

  onClearCategories = () => {
    this.setState({
      categoryQuery: '',
      searchQuery: '',
      currentPage: 0,
      results: []
    });
  };

  animationCategoriesRendering() {
    let categories = this.props.spriteLab
      ? CostumeCategories
      : AnimationCategories;
    return Object.keys(categories).map(category => (
      <AnimationPickerListItem
        key={category}
        label={categories[category]}
        category={category}
        onClick={this.onCategoryChange}
      />
    ));
  }

  animationItemsRendering(animations) {
    return animations.map(animationProps => (
      <AnimationPickerListItem
        key={animationProps.sourceUrl}
        label={animationProps.name}
        animationProps={animationProps}
        onClick={this.props.onPickLibraryAnimation.bind(this, animationProps)}
        playAnimations={this.props.playAnimations}
      />
    ));
  }

  render() {
    let categories = this.props.spriteLab
      ? CostumeCategories
      : AnimationCategories;

    // Hide the upload option for students in spritelab
    let hideUploadOption = this.props.spriteLab;

    return (
      <div style={{marginBottom: 10}}>
        <h1 style={styles.title}>{msg.animationPicker_title()}</h1>
        {!this.props.is13Plus && !hideUploadOption && (
          <WarningLabel>{msg.animationPicker_warning()}</WarningLabel>
        )}
        <SearchBar
          placeholderText={i18n.animationSearchPlaceholder()}
          onChange={evt => this.onSearchQueryChange(evt.target.value)}
        />
        {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') && (
          <div style={animationPickerStyles.navigation}>
            {this.state.categoryQuery !== '' && (
              <div style={animationPickerStyles.breadCrumbs}>
                <span
                  onClick={this.onClearCategories}
                  style={animationPickerStyles.allAnimations}
                >
                  {'All categories > '}
                </span>
                <span>{categories[this.state.categoryQuery]}</span>
              </div>
            )}
          </div>
        )}
        <ScrollableList
          style={{maxHeight: MAX_HEIGHT}}
          onScroll={this.handleScroll}
        >
          {' '}
          {/* TODO: Is this maxHeight appropriate? */}
          {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') &&
            this.state.results.length === 0 && (
              <div style={animationPickerStyles.emptyResults}>
                Sorry, no results found.
              </div>
            )}
          {((this.state.searchQuery === '' &&
            this.state.categoryQuery === '') ||
            this.state.results.length === 0) && (
            <div>
              <AnimationPickerListItem
                label={msg.animationPicker_drawYourOwn()}
                icon="pencil"
                onClick={this.props.onDrawYourOwnClick}
              />
              {!hideUploadOption && (
                <AnimationPickerListItem
                  label={msg.animationPicker_uploadImage()}
                  icon="upload"
                  onClick={this.props.onUploadClick}
                />
              )}
            </div>
          )}
          {this.state.searchQuery === '' &&
            this.state.categoryQuery === '' &&
            this.animationCategoriesRendering()}
          {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') &&
            this.animationItemsRendering(this.state.results || [])}
        </ScrollableList>
      </div>
    );
  }
}

export const UnconnectedAnimationPickerBody = Radium(AnimationPickerBody);

export default connect(state => ({
  spriteLab: state.pageConstants.isBlockly
}))(Radium(AnimationPickerBody));

export const WarningLabel = ({children}) => (
  <span style={{color: color.red}}>{children}</span>
);
WarningLabel.propTypes = {
  children: PropTypes.node
};
