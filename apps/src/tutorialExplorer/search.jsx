import PropTypes from 'prop-types';
import React from 'react';
import FilterGroupContainer from './filterGroupContainer';
import SearchBar from '../templates/SearchBar';

export default class Search extends React.Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    showClearIcon: PropTypes.bool
  };

  handleChange = e => {
    const value = e ? e.target.value : '';
    this.props.onChange(value);
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
