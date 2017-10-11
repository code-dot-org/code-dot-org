/* OrgNames: A list of unique org names.
 */

import React, {PropTypes} from 'react';
import FilterGroupContainer from './filterGroupContainer';
import i18n from './locale';

const styles = {
  tutorialSetNoTutorials: {
    backgroundColor: "#d6d6d6",
    padding: 20,
    margin: 60,
    whiteSpace: "pre-wrap"
  },
  select: {
    width: '100%',
    marginTop: 10
  }
};

const FilterGroupOrgNames = React.createClass({
  propTypes: {
    orgName: PropTypes.string,
    uniqueOrgNames: PropTypes.arrayOf(PropTypes.string).isRequired,
    onUserInput: PropTypes.func.isRequired
  },

  handleChangeOrgName(event) {
    this.props.onUserInput(
      event.target.value
    );
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
          <option key="all" value="all">
            {i18n.filterOrgNamesAll()}
          </option>
          {this.props.uniqueOrgNames.map(item => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>
      </FilterGroupContainer>
    );
  }
});

export default FilterGroupOrgNames;
