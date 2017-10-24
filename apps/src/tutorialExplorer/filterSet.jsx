/* FilterSet: The overall search area in TutorialExplorer.  Contains a set of filter groups.
 */

import React, {PropTypes} from 'react';
import FilterGroup from './filterGroup';
import RoboticsButton from './roboticsButton';
import FilterGroupOrgNames from './filterGroupOrgNames';
import FilterGroupSortBy from './filterGroupSortBy';
import { TutorialsSortBy } from './util';
import { getResponsiveValue } from './responsive';
import i18n from '@cdo/tutorialExplorer/locale';

const styles = {
  countContainer: {
    float: "left",
    paddingTop: 5,
    paddingBottom: 10,
    paddingRight: 40,
    paddingLeft: 7
  },
  countBar: {
    backgroundColor: "rgb(0, 178, 192)",
    color: 'white',
    padding: 7,
    textAlign: 'center'
  }
};

export default class FilterSet extends React.Component {
  static propTypes = {
    mobileLayout: PropTypes.bool.isRequired,
    uniqueOrgNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    orgName: PropTypes.string,
    showSortDropdown: PropTypes.bool.isRequired,
    defaultSortBy: PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired,
    sortBy: PropTypes.oneOf(Object.keys(TutorialsSortBy)).isRequired,
    filterGroups: PropTypes.array.isRequired,
    selection: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
    filteredTutorialsCount: PropTypes.number.isRequired,
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
    const tutorialCount = this.props.filteredTutorialsCount;
    const tutorialCountString = tutorialCount === 1 ?
      i18n.filterHeaderTutorialCountSingle() :
      i18n.filterHeaderTutorialCountPlural({tutorial_count: tutorialCount});

    const countContainerStyle = {
      ...styles.countContainer,
      width: getResponsiveValue({xs: 100, sm: 50, md: 100})
    };

    return (
      <div>
        {false && !this.props.mobileLayout && (
          <div style={countContainerStyle}>
            <div style={styles.countBar}>
              {tutorialCountString}
            </div>
          </div>
        )}

        {false && this.props.showSortDropdown && (
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
