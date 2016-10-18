/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * tutorialExplorer.  Includes the TutorialExplorer React class.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import FilterSet from './filterSet';
import TutorialSet from './tutorialSet';
import shapes from './shapes';

const TutorialExplorer = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.array.isRequired,
    filterGroups: React.PropTypes.array.isRequired,
    initialFilters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    locale: React.PropTypes.string.isRequired,
    backButton: shapes.backButton,
    imageButton: shapes.imageButton
  },

  getInitialState() {
    let filters = {};

    for (const filterGroup of this.props.filterGroups) {
      filters[filterGroup.name] = [];
      const initialFiltersForGroup = this.props.initialFilters[filterGroup.name];
      if (initialFiltersForGroup) {
        filters[filterGroup.name] = initialFiltersForGroup;
      }
    }
    return {
      filters: filters
    };
  },

  /**
   * Called when a filter in a filter group has its checkbox
   * checked or unchecked.  Updates the filters in state.
   *
   * @param {string} filterGroup - The name of the filter group.
   * @param {string} filterEntry - The name of the filter entry.
   * @param {bool} value - Whether the entry was checked or not.
   */
  handleUserInput(filterGroup, filterEntry, value) {
    const state = Immutable.fromJS(this.state);

    let newState = {};
    if (value) {
      // Add value to end of array.
      newState = state.updateIn(['filters', filterGroup], arr => arr.push(filterEntry));
    } else {
      // Find and remove specific value from array.
      const itemIndex = this.state.filters[filterGroup].indexOf(filterEntry);
      newState = state.updateIn(['filters', filterGroup], arr => arr.splice(itemIndex, 1));
    }
    this.setState(newState.toJS());
  },

  isLocaleEnglish() {
    return this.props.locale.substring(0,2) === "en";
  },

  render() {
    return (
      <div>
        <FilterSet
          filterGroups={this.props.filterGroups}
          onUserInput={this.handleUserInput}
          selection={this.state.filters}
          backButton={this.props.backButton}
          imageButton={this.props.imageButton}
        />

        {!this.isLocaleEnglish() && (
          <div>
            <h1>Tutorials in your language</h1>
            <TutorialSet
              tutorials={this.props.tutorials}
              filters={this.state.filters}
              locale={this.props.locale}
              specificLocale={true}
            />
            <h1>Tutorials in many languages</h1>
          </div>
        )}

        <TutorialSet
          tutorials={this.props.tutorials}
          filters={this.state.filters}
          locale={this.props.locale}
        />
      </div>
    );
  }
});

window.TutorialExplorerManager = function (options) {
  this.options = options;

  this.renderToElement = function (element) {
    ReactDOM.render(
      <TutorialExplorer
        tutorials={options.tutorials}
        filterGroups={options.filters}
        initialFilters={options.initialFilters}
        locale={options.locale}
        backButton={options.backButton}
        imageButton={options.imageButton}
      />,
      element
    );
  };
};
