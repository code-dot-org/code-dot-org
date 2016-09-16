/** Body of the animation picker dialog */
import React from 'react';
import Radium from 'radium';
import Immutable from 'immutable';
import color from '../../color';
import gamelabMsg from '@cdo/gamelab/locale';
import animationLibrary from '../animationLibrary.json';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import AnimationPickerSearchBar from './AnimationPickerSearchBar.jsx';

const MAX_SEARCH_RESULTS = 18;

const AnimationPickerBody = React.createClass({
  propTypes: {
    is13Plus: React.PropTypes.bool,
    onDrawYourOwnClick: React.PropTypes.func.isRequired,
    onPickLibraryAnimation: React.PropTypes.func.isRequired,
    onUploadClick: React.PropTypes.func.isRequired
  },

  getInitialState() {
    return {
      searchQuery: ''
    };
  },

  onSearchQueryChange(value) {
    this.setState({searchQuery: value});
  },

  render() {
    var pageOfResults = searchAnimations(this.state.searchQuery);
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
        <ScrollableList style={{maxHeight: 400}}> {/* TODO: Is this maxHeight appropriate? */}
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
          {pageOfResults.map(animationProps =>
            <AnimationPickerListItem
              key={animationProps.sourceUrl}
              label={`${animationProps.name} (${animationProps.frameCount})`}
              animationProps={animationProps}
              onClick={this.props.onPickLibraryAnimation.bind(this, animationProps)}
            />
          )}
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
 * @return {Array.<SerializedAnimationProps>} - roughly
 */
function searchAnimations(searchQuery) {
  // Make sure to generate the search regex in advance, only once.
  // Search is case-insensitive
  // Match any word boundary or underscore followed by the search query.
  // Example: searchQuery "bar"
  //   Will match: "barbell", "foo-bar", "foo_bar" or "foo bar"
  //   Will not match: "foobar", "ubar"
  const searchRegExp = new RegExp('(?:\\b|_)' + searchQuery, 'i');

  // Generate the set of all results associated with all matched aliases
  const resultSet = Object.keys(animationLibrary.aliases)
      .filter(alias => searchRegExp.test(alias))
      .reduce((resultSet, nextAlias) => {
        return resultSet.union(animationLibrary.aliases[nextAlias]);
      }, Immutable.Set());

  // Finally alphabetize the results (for stability), take only the first
  // MAX_SEARCH_RESULTS so we don't load too many images at once, and return
  // the associated metadata for each result, along with
  return resultSet
      .sort()
      .slice(0, MAX_SEARCH_RESULTS)
      .map(result => animationLibrary.metadata[result])
      .toArray();
}
