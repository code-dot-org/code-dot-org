/* FilterGroup: A group of filter choices, for the search area in TutorialExplorer.
 * Contains a heading and a collection of filter choices.
 */

import React, {PropTypes} from 'react';
import FilterGroupContainer from './filterGroupContainer';
import FilterChoice from './filterChoice';

const FilterGroup = React.createClass({
  propTypes: {
    name: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    filterEntries: PropTypes.array.isRequired,
    selection: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired
  },

  render() {
    return (
      <FilterGroupContainer text={this.props.text}>
        {this.props.filterEntries.map(item => (
          <FilterChoice
            groupName={this.props.name}
            name={item.name}
            text={item.text}
            selected={this.props.selection && this.props.selection.indexOf(item.name) !== -1}
            onUserInput={this.props.onUserInput}
            key={item.name}
          />
        ))}
      </FilterGroupContainer>
    );
  }
});

export default FilterGroup;
