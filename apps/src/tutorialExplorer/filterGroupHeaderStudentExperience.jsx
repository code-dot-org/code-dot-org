/* filterGroupHeaderStudentExperience: The student experience dropdown shown in header on desktop.
 */

import React, {PropTypes} from 'react';

const styles = {
  select: {
    backgroundColor: "white",
    color: "dimgrey",
    borderColor: "white",
    height: 34
  }
};

export default class FilterGroupHeaderStudentExperience extends React.Component {
  static propTypes = {
    filterGroup: PropTypes.object.isRequired,
    selection: PropTypes.array.isRequired,
    onUserInput: PropTypes.func.isRequired
  };

  handleChange = (event) => {
    this.props.onUserInput(
      this.props.filterGroup.name,
      event.target.value,
      true
    );
  };

  render() {
    const value = this.props.selection[0];

    return (
      <select
        value={value}
        onChange={this.handleChange}
        style={styles.select}
        className="noFocusButton"
      >
        {this.props.filterGroup.entries.map(item => (
          <option key={item.name} value={item.name}>{item.text}</option>
        ))}
      </select>
    );
  }
}
