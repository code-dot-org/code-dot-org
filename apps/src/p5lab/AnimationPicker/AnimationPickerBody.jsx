/** Body of the animation picker dialog */
import PropTypes from 'prop-types';
import React from 'react';
import color from '@cdo/apps/util/color';
import msg from '@cdo/locale';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import * as dialogStyles from './styles';
import AnimationPickerListItem, {
  getCategory,
} from './AnimationPickerListItem.jsx';
import SearchBar from '@cdo/apps/templates/SearchBar';
import {
  searchAssets,
  filterAnimations,
} from '@cdo/apps/code-studio/assets/searchAssets';
import Button from '@cdo/apps/templates/Button';
import {AnimationProps} from '@cdo/apps/p5lab/shapes';
import {isMobileDevice} from '@cdo/apps/util/browser-detector';
import {PICKER_TYPE} from './AnimationPicker.jsx';
import style from './animation-picker-body.module.scss';
import AnimationUploadButton from './AnimationUploadButton.jsx';

const MAX_SEARCH_RESULTS = 40;

export default class AnimationPickerBody extends React.Component {
  static propTypes = {
    onDrawYourOwnClick: PropTypes.func.isRequired,
    onPickLibraryAnimation: PropTypes.func.isRequired,
    onUploadClick: PropTypes.func.isRequired,
    onAnimationSelectionComplete: PropTypes.func.isRequired,
    playAnimations: PropTypes.bool.isRequired,
    libraryManifest: PropTypes.object.isRequired,
    hideAnimationNames: PropTypes.bool.isRequired,
    navigable: PropTypes.bool.isRequired,
    defaultQuery: PropTypes.object,
    hideBackgrounds: PropTypes.bool.isRequired,
    hideCostumes: PropTypes.bool.isRequired,
    selectedAnimations: PropTypes.arrayOf(AnimationProps).isRequired,
    pickerType: PropTypes.string.isRequired,
    shouldWarnOnAnimationUpload: PropTypes.bool.isRequired,
  };

  state = {
    searchQuery: '',
    categoryQuery: '',
    currentPage: 0,
  };

  componentDidMount() {
    this.scrollListContainer = React.createRef();
    if (this.props.defaultQuery) {
      const currentPage = 0;
      const {results, pageCount} = this.searchAssetsWrapper(
        currentPage,
        this.props.defaultQuery
      );
      let nextQuery = this.props.defaultQuery || {
        categoryQuery: '',
        searchQuery: '',
      };
      this.setState({
        ...nextQuery,
        currentPage,
        results,
        pageCount,
      });
    }
  }

  searchAssetsWrapper = (page, config = {}) => {
    let {searchQuery, categoryQuery, libraryManifest} = config;

    // Set defaults if any config values are undefined.
    if (searchQuery === undefined) {
      searchQuery = this.state.searchQuery;
    }
    if (categoryQuery === undefined) {
      categoryQuery = this.state.categoryQuery;
    }
    if (libraryManifest === undefined) {
      libraryManifest = this.props.libraryManifest;
    }

    return searchAssets(
      searchQuery,
      categoryQuery,
      libraryManifest,
      page,
      MAX_SEARCH_RESULTS
    );
  };

  handleScroll = event => {
    const scrollWindow = event.target;
    const {currentPage, results, pageCount} = this.state;
    const nextPage = currentPage + 1;
    const scrollContainerHeight =
      this.scrollListContainer.current?.clientHeight || 0;
    if (
      scrollWindow.scrollTop + scrollContainerHeight >=
        scrollWindow.scrollHeight * 0.9 &&
      (!pageCount || nextPage <= pageCount)
    ) {
      let {results: newResults, pageCount} = this.searchAssetsWrapper(nextPage);
      newResults = filterAnimations(newResults, this.props);

      this.setState({
        results: [...(results || []), ...newResults],
        currentPage: nextPage,
        pageCount,
      });
    }
  };

  onSearchQueryChange = searchQuery => {
    const currentPage = 0;
    let {results, pageCount} = this.searchAssetsWrapper(currentPage, {
      searchQuery,
    });
    results = filterAnimations(results, this.props);
    this.setState({searchQuery, currentPage, results, pageCount});
  };

  onCategoryChange = event => {
    const categoryQuery = getCategory(event.target);
    const currentPage = 0;
    let {results, pageCount} = this.searchAssetsWrapper(currentPage, {
      categoryQuery,
    });
    results = filterAnimations(results, this.props);
    this.setState({categoryQuery, currentPage, results, pageCount});
  };

  onClearCategories = () => {
    this.setState({
      categoryQuery: '',
      searchQuery: '',
      currentPage: 0,
      results: [],
      pageCount: 0,
    });
  };

  animationCategoriesRendering() {
    let categories = Object.keys(this.props.libraryManifest.categories || []);
    if (this.props.hideBackgrounds) {
      categories = categories.filter(category => category !== 'backgrounds');
    }
    categories.push('all');
    return categories.map(category => (
      <AnimationPickerListItem
        key={category}
        label={
          msg[`animationCategory_${category}`]
            ? msg[`animationCategory_${category}`]()
            : category
        }
        category={category}
        onClick={this.onCategoryChange}
      />
    ));
  }

  animationItemsRendering(animations) {
    return animations.map(animationProps => (
      <AnimationPickerListItem
        key={animationProps.sourceUrl}
        label={this.props.hideAnimationNames ? undefined : animationProps.name}
        animationProps={animationProps}
        onClick={() => this.props.onPickLibraryAnimation(animationProps)}
        playAnimations={this.props.playAnimations}
        selected={this.props.selectedAnimations.some(
          e => e.sourceUrl === animationProps.sourceUrl
        )}
      />
    ));
  }

  render() {
    let assetType;
    switch (this.props.pickerType) {
      case PICKER_TYPE.spritelab:
        assetType = msg.costumeMode();
        break;
      case PICKER_TYPE.gamelab:
        assetType = msg.animationMode();
        break;
      case PICKER_TYPE.backgrounds:
        assetType = msg.backgroundMode();
        break;
    }
    if (!this.props.libraryManifest) {
      return <div>{msg.loading()}</div>;
    }
    const {searchQuery, categoryQuery, results} = this.state;
    const {
      onDrawYourOwnClick,
      onUploadClick,
      onAnimationSelectionComplete,
      shouldWarnOnAnimationUpload,
    } = this.props;

    const searching = searchQuery !== '';
    const inCategory = categoryQuery !== '';
    const isBackgroundsTab = this.props.pickerType === 'backgrounds';
    // Display second "Done" button. Useful for mobile, where the original "done" button might not be on screen when
    // animation picker is loaded. 600 pixels is minimum height of the animation picker.
    const shouldDisplaySecondDoneButton = isMobileDevice();
    // We show the draw your own and upload buttons if the user is either:
    // Not currently searching and not in a category, unless that category is backgrounds
    // OR they are searching but there were no results
    const showDrawAndUploadButtons =
      (!searching && (!inCategory || isBackgroundsTab)) || results.length === 0;

    return (
      <div style={{marginBottom: 10}}>
        {shouldDisplaySecondDoneButton && (
          <Button
            text={msg.done()}
            onClick={onAnimationSelectionComplete}
            color={Button.ButtonColor.brandSecondaryDefault}
          />
        )}
        <h1 style={dialogStyles.title}>
          {msg.animationPicker_title({assetType})}
        </h1>
        {showDrawAndUploadButtons && (
          <WarningLabel>{msg.animationPicker_warning()}</WarningLabel>
        )}
        <SearchBar
          placeholderText={msg.animationSearchPlaceholder()}
          onChange={evt => this.onSearchQueryChange(evt.target.value)}
        />
        {(searching || inCategory) && (
          <div className={style.navigation}>
            {inCategory && (
              <div className={style.breadCrumbs}>
                {this.props.navigable && (
                  <span
                    onClick={this.onClearCategories}
                    className={style.allAnimations}
                  >
                    {`${msg.animationPicker_allCategories()} > `}
                  </span>
                )}
                <span>{msg[`animationCategory_${categoryQuery}`]()}</span>
              </div>
            )}
          </div>
        )}
        <div ref={this.scrollListContainer}>
          <ScrollableList
            className="uitest-animation-picker-list"
            style={{maxHeight: '55vh'}}
            onScroll={this.handleScroll}
          >
            {' '}
            {(searching || inCategory) && results.length === 0 && (
              <div className={style.emptyResults}>
                {msg.animationPicker_noResultsFound()}
              </div>
            )}
            {showDrawAndUploadButtons && (
              <div>
                <AnimationPickerListItem
                  label={msg.animationPicker_drawYourOwn()}
                  isBackgroundsTab={isBackgroundsTab}
                  icon="pencil"
                  onClick={onDrawYourOwnClick}
                />
                <AnimationUploadButton
                  onUploadClick={onUploadClick}
                  shouldWarnOnAnimationUpload={shouldWarnOnAnimationUpload}
                  isBackgroundsTab={isBackgroundsTab}
                />
              </div>
            )}
            {searchQuery === '' &&
              categoryQuery === '' &&
              this.animationCategoriesRendering()}
            {(searchQuery !== '' || categoryQuery !== '') &&
              this.animationItemsRendering(results || [])}
          </ScrollableList>
        </div>
        {(searchQuery !== '' || categoryQuery !== '') && (
          <div className={style.footer}>
            <Button
              className="ui-test-selector-done-button"
              text={msg.done()}
              onClick={onAnimationSelectionComplete}
              color={Button.ButtonColor.brandSecondaryDefault}
            />
          </div>
        )}
      </div>
    );
  }
}

export const WarningLabel = ({children}) => (
  <span style={{color: color.red}}>{children}</span>
);
WarningLabel.propTypes = {
  children: PropTypes.node,
};
