import React, { Component, PropTypes } from 'react';
import color from "../../util/color";

const styles = {
  option: {
    fontSize: 14,
    color: color.charcoal,
    fontFamily: '"Gotham 4r", sans-serif',
    padding: 5
  },
  checkbox: {
    width: 25,
    height: 25,
    marginTop: -2
  }
};

class Checkbox extends Component {
  state = {
    isChecked: false,
  }

  toggleCheckboxChange = () => {
    const { handleCheckboxChange, label } = this.props;

    this.setState(({ isChecked }) => (
      {
        isChecked: !isChecked,
      }
    ));
    handleCheckboxChange(label);
  }

  render() {
    const { label } = this.props;
    const { isChecked } = this.state;

    return (
      <div className="checkbox">
        <label style={styles.option}>
          <input
            type="checkbox"
            value={label}
            checked={isChecked}
            onChange={this.toggleCheckboxChange}
            style={styles.checkbox}
          />
          {label}
        </label>
      </div>
    );
  }
}

Checkbox.propTypes = {
  label: PropTypes.string.isRequired,
  handleCheckboxChange: PropTypes.func.isRequired,
};

export default Checkbox;
