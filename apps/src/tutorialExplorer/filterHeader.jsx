/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React, {PropTypes} from 'react';
import BackButton from './backButton';
import { TutorialsSortBy } from './util';
import { Sticky } from 'react-sticky';
import i18n from './locale';

const styles = {
  header: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 7,
    paddingRight: 7
  },
  bar: {
    backgroundColor: "rgb(0, 178, 192)",
    color: "white",
    minHeight: 44,
    overflow: "hidden"
  },
  select: {
    backgroundColor: "rgb(101, 205, 214)",
    color: "white",
    borderColor: "white",
    height: 34
  },
  button: {
    backgroundColor: "rgb(101, 205, 214)",
    color: "white",
    borderColor: "white",
    height: 34
  },
  filterBy: {
    float: "left",
    lineHeight: "42px"
  },
  left: {
    float: "left",
    lineHeight: "42px",
    marginLeft: 10
  },
  right: {
    float: "right",
    lineHeight: "42px",
    marginRight: 10
  }
};

const FilterHeader = React.createClass({
  propTypes: {
    onUserInput: PropTypes.func.isRequired,
    sortBy: PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired,
    backButton: PropTypes.bool,
    filteredTutorialsCount: PropTypes.number.isRequired,
    mobileLayout: PropTypes.bool.isRequired,
    showingModalFilters: PropTypes.bool.isRequired,
    showModalFilters: PropTypes.func.isRequired,
    hideModalFilters: PropTypes.func.isRequired,
    showSortDropdown: PropTypes.bool.isRequired,
    defaultSortBy: PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired
  },

  shouldShowOpenFiltersButton() {
    return this.props.mobileLayout && !this.props.showingModalFilters;
  },

  shouldShowCloseFiltersButton() {
    return this.props.mobileLayout && this.props.showingModalFilters;
  },

  shouldShowSortDropdown() {
    return this.props.showSortDropdown &&
      !(this.props.mobileLayout && this.props.showingModalFilters);
  },

  handleChangeSort(event) {
    this.props.onUserInput(
      event.target.value
    );
  },

  render() {
    const tutorialCount = this.props.filteredTutorialsCount;
    const tutorialCountString = tutorialCount === 1 ?
      i18n.filterHeaderTutorialCountSingle() :
      i18n.filterHeaderTutorialCountPlural({tutorial_count: tutorialCount});

    // Show the default sort criteria first.  That way, when the dropdown that
    // shows "Sort" is opened to show the two possible options, the default
    // will be first and will get the checkmark that seems to be always shown
    // next to the first option.
    let sortOptions;
    if (this.props.defaultSortBy === TutorialsSortBy.popularityrank) {
      sortOptions = [
        {value: "popularityrank", text: i18n.filterHeaderPopularityRank()},
        {value: "displayweight", text: i18n.filterHeaderDisplayWeight()}
      ];
    } else {
      sortOptions = [
        {value: "displayweight", text: i18n.filterHeaderDisplayWeight()},
        {value: "popularityrank", text: i18n.filterHeaderPopularityRank()}
      ];
    }

    return (
      <div style={styles.header}>
        {this.props.backButton && <BackButton/>}

        <Sticky style={{zIndex: 1}}>
          <div style={styles.bar}>
            <div style={styles.left}>
              {this.props.mobileLayout && (
                <span>
                  {tutorialCountString}
                </span>
              )}

              {!this.props.mobileLayout && (
                <div style={styles.filterBy}>
                  {i18n.filterHeaderFilterBy()}
                </div>
              )}
            </div>

            <div style={styles.right}>
              {!this.props.mobileLayout && (
                <span>
                  {tutorialCountString}
                </span>
              )}

              &nbsp;
              &nbsp;

              {this.shouldShowSortDropdown() && (
                <select
                  value={this.props.sortBy}
                  onChange={this.handleChangeSort}
                  style={styles.select}
                  className="noFocusButton"
                >
                  <option disabled hidden value="default">{i18n.filterHeaderDefault()}</option>
                  <option value={sortOptions[0].value}>{sortOptions[0].text}</option>
                  <option value={sortOptions[1].value}>{sortOptions[1].text}</option>
                </select>
              )}

              {this.shouldShowOpenFiltersButton() && (
                <span>
                  &nbsp;
                  &nbsp;
                  <button
                    onClick={this.props.showModalFilters}
                    style={styles.button}
                    className="noFocusButton"
                  >
                    {i18n.filterHeaderShowFilters()}
                  </button>
                </span>
              )}

              {this.shouldShowCloseFiltersButton() && (
                <span>
                  &nbsp;
                  &nbsp;
                  <button
                    onClick={this.props.hideModalFilters}
                    style={styles.button}
                    className="noFocusButton"
                  >
                    {i18n.filterHeaderHideFilters()}
                  </button>
                </span>
              )}
            </div>
          </div>
        </Sticky>
      </div>
    );
  }
});

export default FilterHeader;
