/**
 * Entry point to build a bundle containing a set of globals used when displaying
 * tutorialExplorer.  Includes the TutorialExplorer React class.
 */

import React from 'react';
import ReactDOM from 'react-dom';
import Immutable from 'immutable';
import FilterSet from './filterSet';
import TutorialSet from './tutorialSet';

const TutorialExplorer = React.createClass({
  propTypes: {
    filterGroups: React.PropTypes.array.isRequired,
    tutorials: React.PropTypes.array.isRequired,
    locale: React.PropTypes.string.isRequired
  },

  getInitialState() {
    let filters = {};

    for (const filterGroup of this.props.filterGroups) {
      filters[filterGroup.name] = [];
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
        filterGroups={options.filters}
        tutorials={options.tutorials}
        locale={options.locale}
      />,
      element
    );
  };
};
