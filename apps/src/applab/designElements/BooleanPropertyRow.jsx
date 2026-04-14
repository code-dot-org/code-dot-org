import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
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
    return (
      <div style={rowStyle.container}>
        <div style={rowStyle.description}>{this.props.desc}</div>
        <div>
          <FontAwesomeV6Icon
            iconName={this.state.isChecked ? 'square-check' : 'square'}
            iconStyle="regular"
            className="custom-checkbox"
            style={rowStyle.checkbox}
            onClick={this.handleClick}
          />
        </div>
      </div>
    );
  }
}
