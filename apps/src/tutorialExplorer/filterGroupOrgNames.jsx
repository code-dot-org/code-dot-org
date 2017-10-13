/* OrgNames: A list of unique org names.
 */

import React, {PropTypes} from 'react';
import FilterGroupContainer from './filterGroupContainer';
import { TutorialsOrgName } from './util';
import i18n from './locale';

const styles = {
  select: {
    width: '100%',
    marginTop: 10,
    height: 26
  }
};

const FilterGroupOrgNames = React.createClass({
  propTypes: {
    orgName: PropTypes.string.isRequired,
    uniqueOrgNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onUserInput: PropTypes.func.isRequired
  },

  handleChangeOrgName(event) {
    this.props.onUserInput(
      event.target.value
    );
  },

  truncateOrgName(orgName) {
    // Truncate and ellipsis organization name to limit length in dropdown.
    const maxOrgNameChars = 25;
    if (orgName.length > maxOrgNameChars) {
      return orgName.substring(0, maxOrgNameChars) + '...';
    } else {
      return orgName;
    }
  },

  render() {
    return (
      <FilterGroupContainer text={i18n.filterOrgNames()}>
        <select
          value={this.props.orgName}
          onChange={this.handleChangeOrgName}
          style={styles.select}
          className="noFocusButton"
        >
          <option
            key={TutorialsOrgName.all}
            value={TutorialsOrgName.all}
          >
            {i18n.filterOrgNamesAll()}
          </option>
          {this.props.uniqueOrgNames.map(item => (
            <option
              key={item}
              value={item}
            >
              {this.truncateOrgName(item)}
            </option>
          ))}
        </select>
      </FilterGroupContainer>
    );
  }
});

export default FilterGroupOrgNames;
