/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React from 'react';
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
    onUserInput: React.PropTypes.func.isRequired,
    sortBy: React.PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired,
    backButton: React.PropTypes.bool,
    filteredTutorialsCount: React.PropTypes.number.isRequired,
    mobileLayout: React.PropTypes.bool.isRequired,
    showingModalFilters: React.PropTypes.bool.isRequired,
    showModalFilters: React.PropTypes.func.isRequired,
    hideModalFilters: React.PropTypes.func.isRequired,
    showSortBy: React.PropTypes.bool.isRequired
  },

  shouldShowOpenFiltersButton() {
    return this.props.mobileLayout && !this.props.showingModalFilters;
  },

  shouldShowCloseFiltersButton() {
    return this.props.mobileLayout && this.props.showingModalFilters;
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

              {this.props.showSortBy && (
                <select
                  value={this.props.sortBy}
                  onChange={this.handleChangeSort}
                  style={styles.select}
                  className="noFocusButton"
                >
                  <option disabled hidden value="default">{i18n.filterHeaderDefault()}</option>
                  <option value="displayweight">{i18n.filterHeaderDisplayWeight()}</option>
                  <option value="popularityrank">{i18n.filterHeaderPopularityRank()}</option>
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
