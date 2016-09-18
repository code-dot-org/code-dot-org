/* FilterGroup: A group of filter choices, for the search area in TutorialExplorer.
 * Contains a heading and a collection of filter choices.
 */

import React from 'react';
import FilterChoice from './filterChoice';

const styles = {
  filterGroupOuter: {
    paddingTop: 20,
    paddingRight: 40
  },
  filterGroupText: {
    fontFamily: '"Gotham 5r", sans-serif',
    borderBottom: 'solid grey 1px'
  }
};

const FilterGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string.isRequired,
    text: React.PropTypes.string.isRequired,
    filterEntries: React.PropTypes.array.isRequired,
    selection: React.PropTypes.array.isRequired,
    onUserInput: React.PropTypes.func.isRequired
  },

  render() {
    return (
      <div style={styles.filterGroupOuter}>
        <div style={styles.filterGroupText}>
          {this.props.text}
        </div>
        {this.props.filterEntries.map(item => (
          <FilterChoice
            groupName={this.props.name}
            name={item.name}
            text={item.text}
            selected={this.props.selection && this.props.selection.includes(item.name)}
            onUserInput={this.props.onUserInput}
            key={item.name}
          />
        ))}
      </div>
    );
  }
});

export default FilterGroup;
