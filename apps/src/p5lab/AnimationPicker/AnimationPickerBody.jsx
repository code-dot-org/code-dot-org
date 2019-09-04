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
import PaginationWrapper from '@cdo/apps/templates/PaginationWrapper';
import {searchAssets} from '@cdo/apps/code-studio/assets/searchAssets';
import {connect} from 'react-redux';

const MAX_SEARCH_RESULTS = 27;
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

  state = {
    searchQuery: '',
    categoryQuery: '',
    currentPage: 0
  };

  onSearchQueryChange = value => {
    this.setState({searchQuery: value, currentPage: 0});
  };

  onCategoryChange = event => {
    this.setState({categoryQuery: event.target.className, currentPage: 0});
  };

  onClearCategories = () => {
    this.setState({categoryQuery: '', searchQuery: '', currentPage: 0});
  };

  onChangePageNumber = number => {
    this.setState({currentPage: number - 1});
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
    let libraryManifest = this.props.spriteLab
      ? spriteCostumeLibrary
      : animationLibrary;
    let categories = this.props.spriteLab
      ? CostumeCategories
      : AnimationCategories;
    let {results, pageCount} = searchAssets(
      this.state.searchQuery,
      this.state.categoryQuery,
      libraryManifest,
      this.state.currentPage,
      MAX_SEARCH_RESULTS
    );

    // Hide the upload option for students in spritelab
    let hideUploadOption = this.props.spriteLab;

    return (
      <div>
        <h1 style={styles.title}>{msg.animationPicker_title()}</h1>
        {!this.props.is13Plus && !hideUploadOption && (
          <WarningLabel>{msg.animationPicker_warning()}</WarningLabel>
        )}
        <SearchBar
          placeholderText={'Search for images'}
          styles={{}}
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
            {(this.state.searchQuery !== '' ||
              this.state.categoryQuery !== '') && (
              <div style={animationPickerStyles.pagination}>
                <PaginationWrapper
                  totalPages={pageCount}
                  currentPage={this.state.currentPage + 1}
                  onChangePage={this.onChangePageNumber}
                />
              </div>
            )}
          </div>
        )}
        <ScrollableList style={{maxHeight: 420}}>
          {' '}
          {/* TODO: Is this maxHeight appropriate? */}
          {pageCount === 0 && (
            <div style={animationPickerStyles.emptyResults}>
              Sorry, no results found.
            </div>
          )}
          {((this.state.searchQuery === '' &&
            this.state.categoryQuery === '') ||
            pageCount === 0) && (
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
            this.animationItemsRendering(results)}
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
