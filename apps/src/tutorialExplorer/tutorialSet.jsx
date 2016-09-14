/* TutorialSet: The overall tutorial area in TutorialExplorer.  Contains a set of tutorials.
 */

import React from 'react';
import FilterSet from './filterSet';
import Tutorial from './tutorial';
import shapes from './shapes';

const TutorialSet = React.createClass({
  propTypes: {
    tutorials: React.PropTypes.arrayOf(shapes.tutorial.isRequired).isRequired,
    filters: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    locale: React.PropTypes.string.isRequired
  },

  /**
   * Returns true if we should show this item based on current filter settings.
   * It goes through all active filter categories.  If no filters are set for
   * a filter group, then that item will default to showing, so long as no other
   * filter group prevents it from showing.
   * But if we do have a filter set for a filter group, and the tutorial is tagged
   * for that filter group, then at least one of the active filters must match a tag.
   * e.g. If the user chooses two platforms, then at least one of the platforms
   * must match a platform tag on the tutorial.
   * A similar check for language is done first.
   *
   * @param {object} tutorial - Single tutorial, containing a variety of
   *   strings, each of which is a list of tags separated by commas, no spaces.
   */
  filterFn: function (tutorial) {

    // First check that the tutorial language doesn't exclude it immediately.
    // If the tags contain some languages, and we don't have a match, then
    // hide the tutorial.
    if (tutorial.languages_supported) {
      const languageTags = tutorial.languages_supported.split(',');
      const currentLocale = this.props.locale;
      if (languageTags.length > 0 &&
        !languageTags.includes(currentLocale) &&
        !languageTags.includes(currentLocale.substring(0,2))) {
        return false;
      }
    }

    // If we miss any filter group, then we don't show the tutorial.
    let filterGroupMiss = false;

    for (const filterGroupName in this.props.filters) {
      const tutorialTags = tutorial["tags_" + filterGroupName];
      if (tutorialTags && tutorialTags.length > 0) {
        const tutorialTagsSplit = tutorialTags.split(',');

        // Now check all the filter group's tags.
        const filterGroup = this.props.filters[filterGroupName];

        // For this filter group, we've not yet found a matching tag between
        // user selected otions and tutorial tags.
        let filterHit = false;

        for (const filterName of filterGroup) {
          if (tutorialTagsSplit.includes(filterName)) {
            // The tutorial had a matching tag.
            filterHit = true;
          }
        }

        // The filter group needs at least one user-selected filter to hit
        // on the tutorial.
        if (filterGroup.length !== 0 && !filterHit) {
          filterGroupMiss = true;
        }
      }
    }

    return !filterGroupMiss;
  },

  render() {
    return (
      <div
        className="col-80"
        style={{float: 'left'}}
      >
        {this.props.tutorials.filter(this.filterFn, this).map(item => (
          <Tutorial
            item={item}
            filters={this.props.filters}
            key={item.code}
          />
        ))}
      </div>
    );
  }
});

export default TutorialSet;
