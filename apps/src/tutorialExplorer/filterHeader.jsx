/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React from 'react';
import BackButton from './backButton';

const styles = {
  header: {
    marginTop: 8,
    marginBottom: 8
  },
  bar: {
    backgroundColor: "#eee",
    height: 42
  },
  filterBy: {
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
    backButton: React.PropTypes.bool,
    filteredTutorialsCount: React.PropTypes.number.isRequired,
    mobileLayout: React.PropTypes.bool.isRequired,
    showingModalFilters: React.PropTypes.bool.isRequired,
    showModalFilters: React.PropTypes.func.isRequired,
    hideModalFilters: React.PropTypes.func.isRequired
  },

  shouldShowOpenFiltersButton() {
    return this.props.mobileLayout && !this.props.showingModalFilters;
  },

  shouldShowCloseFiltersButton() {
    return this.props.mobileLayout && this.props.showingModalFilters;
  },

  render() {
    return (
      <div style={styles.header}>
        {this.props.backButton && <BackButton/>}

        <div style={styles.bar}>
          <div style={styles.filterBy}>
            Filter By
          </div>

          <div style={styles.right}>
            {this.props.filteredTutorialsCount} results

            {this.shouldShowOpenFiltersButton() && (
              <span>
                &nbsp;
                &nbsp;
                <button onClick={this.props.showModalFilters}>
                  Filters
                </button>
              </span>
            )}

            {this.shouldShowCloseFiltersButton() && (
              <span>
                &nbsp;
                &nbsp;
                <button onClick={this.props.hideModalFilters}>
                  Apply
                </button>
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
});

export default FilterHeader;
