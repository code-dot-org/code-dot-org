import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React from 'react';

import SearchBar from '../sharedComponents/SearchBar';

import FilterGroupContainer from './filterGroupContainer';

export default class Search extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    showClearIcon: PropTypes.bool,
  };

  debouncedOnChange = debounce(this.props.onChange, 300);

  handleChange = e => {
    const value = e ? e.target.value : '';
    this.debouncedOnChange(value);
  };

  render() {
    return (
      <FilterGroupContainer text="Search">
        <SearchBar
          clearButton={this.props.showClearIcon}
          onChange={this.handleChange}
          placeholderText=""
        />
      </FilterGroupContainer>
    );
  }
}
