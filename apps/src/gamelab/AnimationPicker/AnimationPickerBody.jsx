/** Body of the animation picker dialog */
import React, {PropTypes} from 'react';
import Radium from 'radium';
import color from "../../util/color";
import {AnimationCategories} from '../constants';
import gamelabMsg from '@cdo/gamelab/locale';
import animationLibrary from '../animationLibrary.json';
import ScrollableList from '../AnimationTab/ScrollableList.jsx';
import styles from './styles';
import AnimationPickerListItem from './AnimationPickerListItem.jsx';
import AnimationPickerSearchBar from './AnimationPickerSearchBar.jsx';
import PaginationWrapper from '../../templates/PaginationWrapper';
import {searchAssets} from '../../code-studio/assets/searchAssets';

const MAX_SEARCH_RESULTS = 27;
const animationPickerStyles = {
  allAnimations: {
    color: color.purple,
    fontFamily: "'Gotham 7r', sans-serif",
    cursor: "pointer"
  },
  breadCrumbs: {
    margin: "8px 0",
    fontSize: 14,
    display: "inline-block"
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
    playAnimations: PropTypes.bool.isRequired
  };

  state = {
    searchQuery: '',
    categoryQuery: '',
    currentPage: 0
  };

  onSearchQueryChange = (value) => {
    this.setState({searchQuery: value, currentPage: 0});
  };

  onCategoryChange = (event) => {
    this.setState({categoryQuery: event.target.className, currentPage: 0});
  };

  onClearCategories = () => {
    this.setState({categoryQuery: '', searchQuery: '', currentPage: 0});
  };

  onChangePageNumber = (number) => {
    this.setState({currentPage: number - 1});
  };

  animationCategoriesRendering() {
    return Object.keys(AnimationCategories).map(category =>
      <AnimationPickerListItem
        key={category}
        label={AnimationCategories[category]}
        category={category}
        onClick={this.onCategoryChange}
      />
    );
  }

  animationItemsRendering(animations) {
    return animations.map(animationProps =>
      <AnimationPickerListItem
        key={animationProps.sourceUrl}
        label={animationProps.name}
        animationProps={animationProps}
        onClick={this.props.onPickLibraryAnimation.bind(this, animationProps)}
        playAnimations={this.props.playAnimations}
      />);
  }

  render() {
    let {results, pageCount} = searchAssets(this.state.searchQuery, this.state.categoryQuery, animationLibrary, this.state.currentPage, MAX_SEARCH_RESULTS);
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
        {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') &&
          <div style={animationPickerStyles.navigation}>
            {this.state.categoryQuery !== '' &&
              <div style={animationPickerStyles.breadCrumbs}>
                <span onClick={this.onClearCategories} style={animationPickerStyles.allAnimations}>{"All categories > "}</span>
                <span>{AnimationCategories[this.state.categoryQuery]}</span>
              </div>
            }
            {(this.state.searchQuery !== '' || this.state.categoryQuery !== '') &&
              <div style={animationPickerStyles.pagination}>
                <PaginationWrapper totalPages={pageCount} currentPage={this.state.currentPage + 1} onChangePage={this.onChangePageNumber}/>
              </div>
            }
          </div>
        }
        <ScrollableList style={{maxHeight: 420}}> {/* TODO: Is this maxHeight appropriate? */}
          {pageCount === 0 &&
            <div style={animationPickerStyles.emptyResults}>Sorry, no results found.</div>
          }
          {((this.state.searchQuery === '' && this.state.categoryQuery === '') || pageCount === 0) &&
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
            this.animationItemsRendering(results)
          }
        </ScrollableList>
      </div>
    );
  }
}

export default Radium(AnimationPickerBody);

export const WarningLabel = ({children}) => (
    <span style={{color: color.red}}>
      {children}
    </span>
);
WarningLabel.propTypes = {
  children: PropTypes.node
};
