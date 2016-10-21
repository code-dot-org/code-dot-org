/* FilterHeader: A header that can contain a back button, a "Filter by", a
 * count of tutorials, and maybe show/hide buttons.
 */

import React from 'react';
import BackButton from './backButton';

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

  barStyle() {
    return {backgroundColor: "#eee", overflow: "hidden", padding: 10};
  },

  render() {
    return (
      <div style={{marginTop: 8, marginBottom: 8}}>
        {this.props.backButton && (
          <div>
            <BackButton/>
          </div>
        )}

        <div style={this.barStyle()}>
          <div style={{float: "left", paddingTop: 7}}>
            Filter By
          </div>

          <div style={{float: "right"}}>
            {this.props.filteredTutorialsCount} results

            &nbsp;
            &nbsp;

            {this.shouldShowOpenFiltersButton() && (
              <button onClick={this.props.showModalFilters}>
                Filters
              </button>
            )}

            {this.shouldShowCloseFiltersButton() && (
              <button onClick={this.props.hideModalFilters}>
                Close
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }
});

export default FilterHeader;
