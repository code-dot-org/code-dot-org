import PropTypes from 'prop-types';
import React from 'react';

import * as rowStyle from './rowStyle';

export default class BooleanPropertyRow extends React.Component {
  static propTypes = {
    initialValue: PropTypes.bool.isRequired,
    handleChange: PropTypes.func,
    desc: PropTypes.node,
  };

  state = {
    isChecked: this.props.initialValue,
  };

  handleClick = () => {
    const checked = !this.state.isChecked;
    this.props.handleChange(checked);
    this.setState({isChecked: checked});
  };

  render() {
    let classes = 'custom-checkbox fa';
    if (this.state.isChecked) {
      classes += ' fa-regular fa-check-square';
    } else {
      classes += ' fa-regular fa-square';
    }

    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <div
            className={classes}
            style={rowStyle.checkbox}
            onClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
}
