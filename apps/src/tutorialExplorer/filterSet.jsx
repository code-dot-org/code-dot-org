/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React from 'react';
import FilterGroup from './filterGroup';
import BackButton from './backButton';
import RoboticsButton from './roboticsButton';

const FilterSet = React.createClass({
  propTypes: {
    filterGroups: React.PropTypes.array.isRequired,
    onUserInput: React.PropTypes.func.isRequired,
    selection: React.PropTypes.objectOf(React.PropTypes.arrayOf(React.PropTypes.string)).isRequired,
    backButton: React.PropTypes.bool,
    roboticsButton: React.PropTypes.bool
  },

  render() {
    return (
      <div>
        <div className="col-20">

          {this.props.backButton && (
            <BackButton/>
          )}

          <div style={{fontSize: 16, paddingLeft: 10}}>
            Filter By
          </div>
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

          {this.props.roboticsButton && (
            <RoboticsButton/>
          )}

        </div>
      </div>
    );
  }
});

export default FilterSet;
