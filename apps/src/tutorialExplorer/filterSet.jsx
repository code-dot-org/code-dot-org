/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React, {PropTypes} from 'react';
import FilterGroup from './filterGroup';
import RoboticsButton from './roboticsButton';
import FilterGroupOrgNames from './filterGroupOrgNames';

export default class FilterSet extends React.Component {
  static propTypes = {
    uniqueOrgNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    filterGroups: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired,
    onUserInputOrgName: PropTypes.func.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    orgName: PropTypes.string,
    roboticsButtonUrl: PropTypes.string
  };

  render() {
    return (
      <div>
        <FilterGroupOrgNames
          orgName={this.props.orgName}
          uniqueOrgNames={this.props.uniqueOrgNames}
          onUserInput={this.props.onUserInputOrgName}
        />

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
}
