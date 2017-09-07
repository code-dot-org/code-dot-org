/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React, {PropTypes} from 'react';
import FilterGroup from './filterGroup';
import RoboticsButton from './roboticsButton';

const FilterSet = React.createClass({
  propTypes: {
    filterGroups: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    roboticsButtonUrl: PropTypes.string
  },

  render() {
    return (
      <div>
        {this.props.filterGroups.map(item =>
          item.display !== false && (
            <FilterGroup
              name={item.name}
              text={item.text}
              filterEntries={item.entries}
              onUserInput={this.props.onUserInput}
              selection={this.props.selection[item.name]}
              key={item.name}
            />
          )
        )}

        {this.props.roboticsButtonUrl && (
          <RoboticsButton url={this.props.roboticsButtonUrl}/>
        )}

      </div>
    );
  }
});

export default FilterSet;
