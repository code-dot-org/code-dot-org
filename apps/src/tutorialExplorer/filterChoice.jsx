/* FilterChoice: An individual filter choice inside a filter group, for the search area in TutorialExplorer.
 * Contains a checkbox and text describing that choice.
 */

import React, {PropTypes} from 'react';

const styles = {
  filterChoiceOuter: {
    userSelect: 'none',
    WebkitUserSelect: 'none',
    MozUserSelect: 'none',
    MsUserSelect: 'none'
  },
  filterChoiceLabel: {
    fontFamily: "\"Gotham 4r\", sans-serif",
    fontSize: 13,
    paddingBottom: 0,
    marginBottom: 0,
    cursor: 'pointer'
  },
  filterChoiceInput: {
    marginRight: 5
  }
};

const FilterChoice = React.createClass({
  propTypes: {
    onUserInput: PropTypes.func.isRequired,
    groupName: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    selected: PropTypes.bool.isRequired,
    text: PropTypes.string.isRequired
  },

  handleChange(event) {
    this.props.onUserInput(
      this.props.groupName,
      this.props.name,
      event.target.checked
    );
  },

  render() {
    return (
      <div style={styles.filterChoiceOuter}>
        <label style={styles.filterChoiceLabel}>
          <input
            type="checkbox"
            checked={this.props.selected}
            onChange={this.handleChange}
            style={styles.filterChoiceInput}
          />
          {this.props.text}
        </label>
      </div>
    );
  }
});

export default FilterChoice;
