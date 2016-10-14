/** Body of the animation picker dialog */
import React from 'react';
import Radium from 'radium';
import Immutable from 'immutable';
import color from '../../color';
import {AnimationCategories} from '../constants';
import gamelabMsg from '@cdo/gamelab/locale';
import animationLibrary from '../animationLibrary.json';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import AnimationPickerSearchBar from './AnimationPickerSearchBar.jsx';

const MAX_SEARCH_RESULTS = 40;
const allAnimationsStyle = {
  color: color.purple,
  fontFamily: "'Gotham 7r', sans-serif, sans-serif",
  cursor: "pointer"
};
const breadCrumbsStyle = {
  margin: "8px 0",
  fontSize: 14
};

const AnimationPickerBody = React.createClass({
  propTypes: {
    is13Plus: React.PropTypes.bool,
    onDrawYourOwnClick: React.PropTypes.func.isRequired,
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadClick: React.PropTypes.func.isRequired,
    playAnimations: React.PropTypes.bool.isRequired
  },

  getInitialState() {
    return {
      searchQuery: '',
      categoryQuery: ''
    };
  },

  onSearchQueryChange(value) {
    this.setState({searchQuery: value});
  },

  onCategoryChange(category) {
    this.setState({categoryQuery: category});
  },

  onClearCategories() {
    this.setState({categoryQuery: '', searchQuery: ''});
  },

  animationCategoriesRendering() {
    return Object.keys(AnimationCategories).map(category =>
      <AnimationPickerListItem
        key={category}
        label={AnimationCategories[category]}
        category={category}
        onClick={() => this.onCategoryChange(category)}
      />
    );
  },

  animationItemsRendering() {
    var pageOfResults = searchAnimations(this.state.searchQuery, this.state.categoryQuery);
    return pageOfResults.map(animationProps =>
      <AnimationPickerListItem
        key={animationProps.sourceUrl}
        label={animationProps.name}
        animationProps={animationProps}
        onClick={this.props.onPickLibraryAnimation.bind(this, animationProps)}
        playAnimations={this.props.playAnimations}
      />);
  },

  render() {
    return (
      <div>
        <h1 style={styles.title}>
          {gamelabMsg.animationPicker_title()}
        </h1>
        {this.props.is13Plus ||
          <WarningLabel>
            {gamelabMsg.animationPicker_warning()}
          </WarningLabel>
        }
        <AnimationPickerSearchBar
          value={this.state.searchQuery}
          onChange={this.onSearchQueryChange}
        />
        {this.state.categoryQuery !== '' &&
          <div style={breadCrumbsStyle}>
            <span onClick={this.onClearCategories} style={allAnimationsStyle}>{"All categories > "}</span>
            <span>{AnimationCategories[this.state.categoryQuery]}</span>
          </div>
        }
        <ScrollableList style={{maxHeight: 400}}> {/* TODO: Is this maxHeight appropriate? */}
          {this.state.searchQuery === '' && this.state.categoryQuery === '' &&
            <div>
              <AnimationPickerListItem
                label={gamelabMsg.animationPicker_drawYourOwn()}
                icon="pencil"
                onClick={this.props.onDrawYourOwnClick}
              />
              <AnimationPickerListItem
                label={gamelabMsg.animationPicker_uploadImage()}
                icon="upload"
                onClick={this.props.onUploadClick}
              />
            </div>
          }
          {this.state.searchQuery === '' && this.state.categoryQuery === '' &&
            this.animationCategoriesRendering()
          }
          {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') &&
            this.animationItemsRendering()
          }
        </ScrollableList>
      </div>
    );
  }
});
export default Radium(AnimationPickerBody);

export const WarningLabel = ({children}) => (
    <span style={{color: color.red}}>
      {children}
    </span>
);
WarningLabel.propTypes = {
  children: React.PropTypes.node
};

/**
 * Given a search query, generate a results list of animationProps objects that
 * can be displayed and used to add an animation to the project.
 * @param {string} searchQuery - text entered by the user to find an animation
 * @param {string} categoryQuery - name of category user selected to filter animations
 * @return {Array.<SerializedAnimationProps>} - Limited list of animations
 *         from the library that match the search query.
 */
function searchAnimations(searchQuery, categoryQuery) {
  // Make sure to generate the search regex in advance, only once.
  // Search is case-insensitive
  // Match any word boundary or underscore followed by the search query.
  // Example: searchQuery "bar"
  //   Will match: "barbell", "foo-bar", "foo_bar" or "foo bar"
  //   Will not match: "foobar", "ubar"
  const searchRegExp = new RegExp('(?:\\b|_)' + searchQuery, 'i');

  // Generate the set of all results associated with all matched aliases
  let resultSet = Object.keys(animationLibrary.aliases)
      .filter(alias => searchRegExp.test(alias))
      .reduce((resultSet, nextAlias) => {
        return resultSet.union(animationLibrary.aliases[nextAlias]);
      }, Immutable.Set());

  if (categoryQuery !== '' && categoryQuery !== 'category_all') {
    let categoryResultSet = Object.keys(animationLibrary.aliases)
      .filter(alias => alias === categoryQuery)
      .reduce((resultSet, nextAlias) => {
        return resultSet.union(animationLibrary.aliases[nextAlias]);
      }, Immutable.Set());
    if (searchQuery !== '') {
      resultSet = resultSet.intersect(categoryResultSet.toArray());
    } else {
      resultSet = categoryResultSet;
    }
  }

  // Finally alphabetize the results (for stability), take only the first
  // MAX_SEARCH_RESULTS so we don't load too many images at once, and return
  // the associated metadata for each result.
  return resultSet
      .sort()
      .slice(0, MAX_SEARCH_RESULTS)
      .map(result => animationLibrary.metadata[result])
      .toArray();
}
