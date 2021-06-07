/* SortBy: The sort order of tutorials.
 */

import PropTypes from 'prop-types';
import React from 'react';
import FilterGroupContainer from './filterGroupContainer';
import {TutorialsSortByOptions} from './util';
import i18n from '@cdo/tutorialExplorer/locale';

export default class FilterGroupSortBy extends React.Component {
  static propTypes = {
    defaultSortBy: PropTypes.oneOf(Object.keys(TutorialsSortByOptions))
      .isRequired,
    sortBy: PropTypes.oneOf(Object.keys(TutorialsSortByOptions)).isRequired,
    onUserInput: PropTypes.func.isRequired
  };

  handleChangeSort = event => {
    this.props.onUserInput(event.target.value);
  };

  render() {
    // Show the default sort criteria first.  That way, when the dropdown that
    // shows "Sort" is opened to show the two possible options, the default
    // will be first and will get the checkmark that seems to be always shown
    // next to the first option.
    let sortOptions;
    if (this.props.defaultSortBy === TutorialsSortByOptions.popularityrank) {
      sortOptions = [
        {value: 'popularityrank', text: i18n.filterSortByPopularityRank()},
        {value: 'displayweight', text: i18n.filterSortByDisplayWeight()}
      ];
    } else {
      sortOptions = [
        {value: 'displayweight', text: i18n.filterSortByDisplayWeight()},
        {value: 'popularityrank', text: i18n.filterSortByPopularityRank()}
      ];
    }

    return (
      <FilterGroupContainer text={i18n.filterSortBy()}>
        <label htmlFor="filter-sort-by-dropdown" className="hidden-label">
          {i18n.filterSortBy()}
        </label>
        <select
          id="filter-sort-by-dropdown"
          value={this.props.sortBy}
          onChange={this.handleChangeSort}
          style={styles.select}
          className="noFocusButton"
        >
          <option value={sortOptions[0].value}>{sortOptions[0].text}</option>
          <option value={sortOptions[1].value}>{sortOptions[1].text}</option>
        </select>
      </FilterGroupContainer>
    );
  }
}

const styles = {
  select: {
    width: '100%',
    marginTop: 10,
    height: 26,
    fontSize: 13
  }
};
