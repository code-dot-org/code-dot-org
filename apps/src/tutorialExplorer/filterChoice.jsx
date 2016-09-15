/* FilterChoice: An individual filter choice inside a filter group, for the search area in TutorialExplorer.
 * Contains a checkbox and text describing that choice.
 */

import React from 'react';
import ReactDOM from 'react-dom';

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
  }
};

const FilterChoice = React.createClass({
  propTypes: {
    onUserInput: React.PropTypes.func.isRequired,
    groupName: React.PropTypes.string.isRequired,
    name: React.PropTypes.string.isRequired,
    selected: React.PropTypes.bool.isRequired,
    text: React.PropTypes.string.isRequired
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
            style={{marginRight: 5}}
          />
          {this.props.text}
        </label>
      </div>
    );
  }
});

export default FilterChoice;
