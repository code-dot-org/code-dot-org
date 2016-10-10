/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React from 'react';
import FilterGroup from './filterGroup';

const FilterSet = React.createClass({
  propTypes: {
    filterGroups: React.PropTypes.array.isRequired,
    onUserInput: React.PropTypes.func.isRequired,
    selection: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired
  },

  render() {
    return (
      <div>
        <div className="col-20">
          <div style={{fontSize: 16}}>
            Filter By
          </div>
          {this.props.filterGroups.map(item => (
            <FilterGroup
              name={item.name}
              text={item.text}
              filterEntries={item.entries}
              onUserInput={this.props.onUserInput}
              selection={this.props.selection[item.name]}
              key={item.name}
            />
          ))}
        </div>
      </div>
    );
  }
});

export default FilterSet;
