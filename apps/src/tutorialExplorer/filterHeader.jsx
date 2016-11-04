/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React from 'react';
import BackButton from './backButton';
import i18n from './locale';

const styles = {
  header: {
    marginTop: 8,
    marginBottom: 8,
    paddingLeft: 7,
    paddingRight: 7
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
    legacyLink: React.PropTypes.string,
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

        {this.props.legacyLink && (
          <div>
            <a href={this.props.legacyLink} style={{textDecoration: "underline", float: "right", paddingBottom: 6}}>
              Back to last year's tutorials
            </a>
            <div style={{clear: "both"}}/>
          </div>
        )}

        <div style={styles.bar}>
          <div style={styles.filterBy}>
            {i18n.filterHeaderFilterBy()}
          </div>

          <div style={styles.right}>
            {this.props.filteredTutorialsCount} results

            {this.shouldShowOpenFiltersButton() && (
              <span>
                &nbsp;
                &nbsp;
                <button onClick={this.props.showModalFilters}>
                  {i18n.filterHeaderShowFilters()}
                </button>
              </span>
            )}

            {this.shouldShowCloseFiltersButton() && (
              <span>
                &nbsp;
                &nbsp;
                <button onClick={this.props.hideModalFilters}>
                  {i18n.filterHeaderHideFilters()}
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
