/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React, {PropTypes} from 'react';
import FilterGroup from './filterGroup';
import RoboticsButton from './roboticsButton';
import FilterGroupSortBy from './filterGroupSortBy';
import FilterGroupOrgNames from './filterGroupOrgNames';
import { TutorialsSortByOptions } from './util';

export default class FilterSet extends React.Component {
  static propTypes = {
    mobileLayout: PropTypes.bool.isRequired,
    uniqueOrgNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    orgName: PropTypes.string,
    showSortDropdown: PropTypes.bool.isRequired,
    defaultSortBy: PropTypes.oneOf(Object.keys(TutorialsSortByOptions)).isRequired,
    sortBy: PropTypes.oneOf(Object.keys(TutorialsSortByOptions)).isRequired,
    filterGroups: PropTypes.array.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    onUserInputFilter: PropTypes.func.isRequired,
    onUserInputOrgName: PropTypes.func.isRequired,
    onUserInputSortBy: PropTypes.func.isRequired,
    roboticsButtonUrl: PropTypes.string
  };

  displayItem = (item) => {
    // Ensure that item isn't forced hidden, and that it's not hidden due to being
    // desktop layout.
    return item.display !== false &&
      (this.props.mobileLayout || (!this.props.mobileLayout && !item.headerOnDesktop));
  };

  render() {
    return (
      <div>
        {this.props.showSortDropdown && (
          <FilterGroupSortBy
            defaultSortBy={this.props.defaultSortBy}
            sortBy={this.props.sortBy}
            onUserInput={this.props.onUserInputSortBy}
          />
        )}

        <FilterGroupOrgNames
          orgName={this.props.orgName}
          uniqueOrgNames={this.props.uniqueOrgNames}
          onUserInput={this.props.onUserInputOrgName}
        />

        {this.props.filterGroups.map(item =>
          this.displayItem(item) && (
            <FilterGroup
              name={item.name}
              text={item.text}
              filterEntries={item.entries}
              onUserInput={this.props.onUserInputFilter}
              selection={this.props.selection[item.name]}
              singleEntry={item.singleEntry || false}
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
