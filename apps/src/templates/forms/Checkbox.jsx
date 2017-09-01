import React, { Component, PropTypes } from 'react';
import color from "../../util/color";

const styles = {
  option: {
    fontSize: 14,
    color: color.charcoal,
    fontFamily: '"Gotham 4r", sans-serif',
    padding: 5,
    display: 'block',
    paddingLeft: '15px',
    textIndent: '-15px'
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
    padding: 0,
    margin:0,
    verticalAlign: 'bottom',
    position: 'relative',
    top: -1,
    overflow: 'hidden',
  },
  margin: {
    leftMargin: 20
  }
};

class Checkbox extends Component {
  static propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    handleCheckboxChange: PropTypes.func.isRequired,
    big: PropTypes.bool
  };

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
    const { label, big, name } = this.props;
    const { isChecked } = this.state;
    const size = big ? styles.optionBig : styles.option;

    return (
      <div style={styles.margin}>
        <label style={size}>
          <input
            type="checkbox"
            name={name}
            value={label}
            checked={isChecked}
            onChange={this.toggleCheckboxChange}
            style={styles.checkbox}
          />
          <span style={{marginLeft:10}}>
            {label}
          </span>
        </label>
      </div>
    );
  }
}

export default Checkbox;
