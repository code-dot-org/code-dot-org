import React, { Component, PropTypes } from 'react';
import color from "../../util/color";

const styles = {
  option: {
    fontSize: 14,
    color: color.charcoal,
    fontFamily: '"Gotham 4r", sans-serif',
    padding: 5
  },
  optionBig: {
    fontSize: 18,
    fontFamily: '"Gotham 7r", sans-serif',
    color: color.charcoal,
    paddingBottom: 10,
    paddingTop: 10
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
    const { label, big } = this.props;
    const { isChecked } = this.state;
    const size = big ? styles.optionBig : styles.option;

    return (
      <div className="checkbox">
        <label style={size}>
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
  big: PropTypes.bool
};

export default Checkbox;
